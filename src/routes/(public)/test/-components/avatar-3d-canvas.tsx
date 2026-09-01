import * as React from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Avatar3dCanvasProps {
  modelUrl: string;
  isSpeaking: boolean;
  cameraPreset?: "face" | "bust" | "chest";
  onMorphsDetected?: (morphNames: string[]) => void;
  className?: string;
}

// Global in-memory cache for loaded GLTF scenes to make model switching instant (<10ms)
const gltfCache = new Map<string, THREE.Group>();

export function Avatar3dCanvas({
  modelUrl,
  isSpeaking,
  cameraPreset = "bust",
  onMorphsDetected,
  className,
}: Avatar3dCanvasProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(!gltfCache.has(modelUrl));
  const [loadProgress, setLoadProgress] = React.useState(0);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // Three.js internal references
  const sceneRef = React.useRef<THREE.Scene | null>(null);
  const cameraRef = React.useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
  const currentModelRef = React.useRef<THREE.Group | null>(null);

  // Bone references for natural posture & conversational gesturing
  const bonesRef = React.useRef<{
    head?: THREE.Bone;
    neck?: THREE.Bone;
    spine?: THREE.Bone;
    spine1?: THREE.Bone;
    leftArm?: THREE.Bone;
    rightArm?: THREE.Bone;
    leftForeArm?: THREE.Bone;
    rightForeArm?: THREE.Bone;
    leftHand?: THREE.Bone;
    rightHand?: THREE.Bone;
  }>({});

  const morphMeshesRef = React.useRef<{ mesh: THREE.Mesh | THREE.SkinnedMesh; dict: { [key: string]: number } }[]>([]);
  const isSpeakingRef = React.useRef(isSpeaking);
  isSpeakingRef.current = isSpeaking;

  // Animation state refs
  const animationFrameIdRef = React.useRef<number | null>(null);
  const blinkStateRef = React.useRef({
    isBlinking: false,
    blinkProgress: 0,
    nextBlinkTime: Date.now() + 2000,
  });

  // Camera framing presets specifically adjusted so the avatar takes up ~3/4 of the viewport
  const getCameraTarget = React.useCallback((preset: string) => {
    switch (preset) {
      case "face":
        // Close-up portrait
        return { camY: 1.54, camZ: 0.58, targetY: 1.52, targetX: 0 };
      case "chest":
        // Lower chest / upper torso
        return { camY: 1.38, camZ: 1.15, targetY: 1.30, targetX: 0 };
      case "bust":
      default:
        // Ideal 3/4 screen height framing: head in top 25%, chest and relaxed arms down to waist
        return { camY: 1.46, camZ: 0.88, targetY: 1.38, targetX: 0 };
    }
  }, []);

  // Function to pose the T-pose skeleton into a relaxed natural sitting / teleconsultation posture
  const applyNaturalSittingPose = (bones: typeof bonesRef.current) => {
    // 1. Lower arms naturally to sides (Z rotation) and slightly forward (X rotation)
    if (bones.leftArm) {
      bones.leftArm.rotation.set(0.22, 0.15, -1.28); // Dropped down alongside body
    }
    if (bones.rightArm) {
      bones.rightArm.rotation.set(0.22, -0.15, 1.28); // Dropped down alongside body
    }

    // 2. Forearms bent gently inward towards lap / desk (natural resting posture)
    if (bones.leftForeArm) {
      bones.leftForeArm.rotation.set(0.42, 0.35, -0.3);
    }
    if (bones.rightForeArm) {
      bones.rightForeArm.rotation.set(0.42, -0.35, 0.3);
    }

    // 3. Hands relaxed
    if (bones.leftHand) {
      bones.leftHand.rotation.set(0.1, 0.0, -0.1);
    }
    if (bones.rightHand) {
      bones.rightHand.rotation.set(0.1, 0.0, 0.1);
    }

    // 4. Spine relaxed slightly upright
    if (bones.spine1) {
      bones.spine1.rotation.set(-0.03, 0.0, 0.0);
    }
  };

  // Initialize Three.js Scene
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera with narrower FOV (28°) for portrait photography look without wide-angle fish-eye distortion
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;
    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 50);
    const { camY, camZ, targetY, targetX } = getCameraTarget(cameraPreset);
    camera.position.set(0, camY, camZ);
    camera.lookAt(targetX, targetY, 0);
    cameraRef.current = camera;

    // 3. Renderer with high-quality PBR settings and transparent background
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting: Realistic 4-point studio portrait setup
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.2);
    scene.add(ambientLight);

    // Key Light (warm soft light front-right)
    const keyLight = new THREE.DirectionalLight(0xfff0e2, 2.4);
    keyLight.position.set(1.2, 2.2, 2.0);
    scene.add(keyLight);

    // Fill Light (cool diffused light front-left to soften harsh shadows)
    const fillLight = new THREE.DirectionalLight(0xe8f4f8, 1.4);
    fillLight.position.set(-1.4, 1.8, 1.6);
    scene.add(fillLight);

    // Hair / Rim Light (highlights head contours and separates from background)
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
    rimLight.position.set(0, 2.8, -1.6);
    scene.add(rimLight);

    // Soft Chest Bounce Light
    const bounceLight = new THREE.DirectionalLight(0xffecd2, 0.5);
    bounceLight.position.set(0, -0.8, 1.2);
    scene.add(bounceLight);

    // 5. Animation Loop with Organic Syllable Burst Lip-Sync & Natural Head Gesture
    let lastTime = performance.now();
    const startTime = performance.now();
    let speechTimer = 0;
    let syllableIntensity = 0;
    let targetJawOpen = 0;
    let targetVisemeAa = 0;
    let targetVisemeO = 0;
    let targetVisemeE = 0;
    let targetSmile = 0.1;
    let targetBrowUp = 0;

    const animate = (currentTime: number = performance.now()) => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      const elapsedTime = (currentTime - startTime) / 1000;
      const now = Date.now();

      // A. Automatic Natural Eye Blinking System (Fast double-blink or single blink)
      const blink = blinkStateRef.current;
      if (now > blink.nextBlinkTime && !blink.isBlinking) {
        blink.isBlinking = true;
        blink.blinkProgress = 0;
      }

      let currentBlinkWeight = 0;
      if (blink.isBlinking) {
        blink.blinkProgress += delta * 8.5; // Realistic blink speed (~120ms)
        if (blink.blinkProgress >= Math.PI) {
          blink.isBlinking = false;
          blink.blinkProgress = 0;
          blink.nextBlinkTime = now + 2400 + Math.random() * 3200; // Next blink in 2.4 - 5.6s
        } else {
          currentBlinkWeight = Math.sin(blink.blinkProgress);
        }
      }

      // B. Organic Syllable-Based Lip-Syncing Engine
      if (isSpeakingRef.current) {
        speechTimer += delta;

        // Human conversational speech rhythm: 3-5 syllables per second with micro-pauses
        const syllableCadence = Math.sin(speechTimer * 16) * Math.sin(speechTimer * 9);
        const speechEnvelope = Math.max(0, syllableCadence + 0.3);

        syllableIntensity = THREE.MathUtils.lerp(syllableIntensity, speechEnvelope, 0.35);

        // Multi-phoneme dynamic blending
        targetJawOpen = syllableIntensity * 0.72 + (Math.sin(speechTimer * 22) > 0.4 ? 0.2 : 0);
        targetVisemeAa = Math.max(0, Math.sin(speechTimer * 14)) * syllableIntensity * 0.65;
        targetVisemeO = Math.sin(speechTimer * 8) > 0.35 ? 0.45 * syllableIntensity : 0;
        targetVisemeE = Math.cos(speechTimer * 12) > 0.25 ? 0.4 * syllableIntensity : 0;
        targetSmile = 0.22 + Math.sin(speechTimer * 3) * 0.08;
        targetBrowUp = Math.sin(speechTimer * 2.5) > 0.5 ? 0.25 : 0.05;
      } else {
        // Return smoothly to calm neutral idle face
        targetJawOpen = 0;
        targetVisemeAa = 0;
        targetVisemeO = 0;
        targetVisemeE = 0;
        targetSmile = 0.08;
        targetBrowUp = 0;
        syllableIntensity = 0;
      }

      // C. Conversational Head & Neck Gesture Dynamics
      const bones = bonesRef.current;
      const idleBreathing = Math.sin(elapsedTime * 1.6) * 0.003;
      
      if (bones.head) {
        // Subtle natural head nods and micro-movements while speaking
        const speechHeadPitch = isSpeakingRef.current ? Math.sin(speechTimer * 5.5) * 0.015 : 0;
        const speechHeadYaw = isSpeakingRef.current ? Math.sin(speechTimer * 2.2) * 0.012 : 0;
        const speechHeadRoll = isSpeakingRef.current ? Math.sin(speechTimer * 1.8) * 0.008 : 0;

        bones.head.rotation.x = THREE.MathUtils.lerp(
          bones.head.rotation.x,
          idleBreathing + speechHeadPitch + 0.02,
          0.15,
        );
        bones.head.rotation.y = THREE.MathUtils.lerp(
          bones.head.rotation.y,
          speechHeadYaw + Math.sin(elapsedTime * 0.6) * 0.005,
          0.15,
        );
        bones.head.rotation.z = THREE.MathUtils.lerp(bones.head.rotation.z, speechHeadRoll, 0.15);
      }

      // D. Apply Morph Targets to Meshes (Blink, Jaw, Visemes, Eyebrows, Smile)
      for (const { mesh, dict } of morphMeshesRef.current) {
        if (!mesh.morphTargetInfluences) continue;

        // 1. Eye Blinks
        const blinkIndices = [
          dict["eyeBlinkLeft"],
          dict["eyeBlinkRight"],
          dict["eyeBlink_L"],
          dict["eyeBlink_R"],
          dict["eyesClosed"],
          dict["blink"],
        ].filter((idx) => idx !== undefined);

        for (const idx of blinkIndices) {
          mesh.morphTargetInfluences[idx] = THREE.MathUtils.lerp(
            mesh.morphTargetInfluences[idx],
            currentBlinkWeight,
            0.6,
          );
        }

        // 2. Jaw Open & Mouth Openings
        const jawIndices = [
          dict["jawOpen"],
          dict["mouthOpen"],
          dict["viseme_sil"],
          dict["A"],
          dict["mouth_open"],
        ].filter((idx) => idx !== undefined);

        for (const idx of jawIndices) {
          mesh.morphTargetInfluences[idx] = THREE.MathUtils.lerp(
            mesh.morphTargetInfluences[idx],
            targetJawOpen,
            0.4,
          );
        }

        // 3. Visemes
        if (dict["viseme_aa"] !== undefined) {
          mesh.morphTargetInfluences[dict["viseme_aa"]] = THREE.MathUtils.lerp(
            mesh.morphTargetInfluences[dict["viseme_aa"]],
            targetVisemeAa,
            0.4,
          );
        }
        if (dict["viseme_O"] !== undefined) {
          mesh.morphTargetInfluences[dict["viseme_O"]] = THREE.MathUtils.lerp(
            mesh.morphTargetInfluences[dict["viseme_O"]],
            targetVisemeO,
            0.35,
          );
        }
        if (dict["viseme_E"] !== undefined) {
          mesh.morphTargetInfluences[dict["viseme_E"]] = THREE.MathUtils.lerp(
            mesh.morphTargetInfluences[dict["viseme_E"]],
            targetVisemeE,
            0.35,
          );
        }
        if (dict["viseme_I"] !== undefined) {
          mesh.morphTargetInfluences[dict["viseme_I"]] = THREE.MathUtils.lerp(
            mesh.morphTargetInfluences[dict["viseme_I"]],
            targetVisemeE * 0.7,
            0.35,
          );
        }
        if (dict["mouthSmile"] !== undefined) {
          mesh.morphTargetInfluences[dict["mouthSmile"]] = THREE.MathUtils.lerp(
            mesh.morphTargetInfluences[dict["mouthSmile"]],
            targetSmile,
            0.2,
          );
        }
        if (dict["browInnerUp"] !== undefined) {
          mesh.morphTargetInfluences[dict["browInnerUp"]] = THREE.MathUtils.lerp(
            mesh.morphTargetInfluences[dict["browInnerUp"]],
            targetBrowUp,
            0.25,
          );
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 6. Handle Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      resizeObserver.disconnect();
      renderer.dispose();
      container.innerHTML = "";
    };
  }, [cameraPreset, getCameraTarget]);

  // Model Loading with in-memory caching for instant switching & bone detection
  React.useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    setLoadError(null);
    morphMeshesRef.current = [];
    bonesRef.current = {};

    // Remove existing model from scene
    if (currentModelRef.current) {
      scene.remove(currentModelRef.current);
      currentModelRef.current = null;
    }

    const setupModelInScene = (model: THREE.Group) => {
      currentModelRef.current = model;
      const foundMorphs: string[] = [];
      const meshesWithMorphs: { mesh: THREE.Mesh | THREE.SkinnedMesh; dict: { [key: string]: number } }[] = [];
      const detectedBones: typeof bonesRef.current = {};

      model.traverse((child) => {
        // 1. Identify Skeleton Bones
        if (child.type === "Bone") {
          const name = child.name.toLowerCase();
          const bone = child as THREE.Bone;

          if (name.includes("head")) detectedBones.head = bone;
          else if (name.includes("neck")) detectedBones.neck = bone;
          else if (name.includes("spine1") || name.includes("chest")) detectedBones.spine1 = bone;
          else if (name.includes("spine")) detectedBones.spine = bone;
          else if (name.includes("leftarm") || name.includes("arm_l") || name.includes("upperarm_l"))
            detectedBones.leftArm = bone;
          else if (name.includes("rightarm") || name.includes("arm_r") || name.includes("upperarm_r"))
            detectedBones.rightArm = bone;
          else if (name.includes("leftforearm") || name.includes("forearm_l") || name.includes("lowerarm_l"))
            detectedBones.leftForeArm = bone;
          else if (name.includes("rightforearm") || name.includes("forearm_r") || name.includes("lowerarm_r"))
            detectedBones.rightForeArm = bone;
          else if (name.includes("lefthand") || name.includes("hand_l")) detectedBones.leftHand = bone;
          else if (name.includes("righthand") || name.includes("hand_r")) detectedBones.rightHand = bone;
        }

        // 2. Enhance PBR Shader Quality on Meshes (Realistic skin, hair, eyes)
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh | THREE.SkinnedMesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          if (mesh.material) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const mat of materials) {
              const matName = mat.name.toLowerCase();
              if ("roughness" in mat && typeof mat.roughness === "number") {
                if (matName.includes("eye") || matName.includes("cornea")) {
                  // High-gloss human eye reflection
                  mat.roughness = 0.05;
                } else if (matName.includes("hair")) {
                  mat.roughness = 0.65;
                } else {
                  // Soft realistic skin roughness
                  mat.roughness = 0.56;
                }
              }
              if ("metalness" in mat && typeof mat.metalness === "number") {
                mat.metalness = 0.02;
              }
            }
          }

          // 3. Register Morph Targets
          if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
            meshesWithMorphs.push({
              mesh,
              dict: mesh.morphTargetDictionary,
            });

            Object.keys(mesh.morphTargetDictionary).forEach((name) => {
              if (!foundMorphs.includes(name)) {
                foundMorphs.push(name);
              }
            });
          }
        }
      });

      bonesRef.current = detectedBones;
      morphMeshesRef.current = meshesWithMorphs;
      onMorphsDetected?.(foundMorphs);

      // Apply natural sitting posture (arms resting comfortably down)
      applyNaturalSittingPose(detectedBones);

      // Center model and set proper height in scene
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());

      model.position.x = -center.x;
      model.position.z = -center.z;
      model.position.y = 0; // Model feet on origin plane

      scene.add(model);
      setIsLoading(false);
    };

    // If already in memory cache, load instantly (<10ms)
    if (gltfCache.has(modelUrl)) {
      const cached = gltfCache.get(modelUrl)!.clone(true);
      setupModelInScene(cached);
      return;
    }

    // Otherwise load with GLTFLoader and cache for subsequent visits
    setIsLoading(true);
    setLoadProgress(0);

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        gltfCache.set(modelUrl, gltf.scene);
        setupModelInScene(gltf.scene.clone(true));
      },
      (progress) => {
        if (progress.total > 0) {
          setLoadProgress(Math.round((progress.loaded / progress.total) * 100));
        }
      },
      (err) => {
        console.error("Failed to load 3D GLB Avatar:", err);
        setLoadError(`Gagal memuat model 3D: ${(err as Error)?.message || "File tidak ditemukan"}`);
        setIsLoading(false);
      },
    );
  }, [modelUrl, onMorphsDetected]);

  // Smooth camera preset updates
  React.useEffect(() => {
    if (!cameraRef.current) return;
    const { camY, camZ, targetY, targetX } = getCameraTarget(cameraPreset);
    
    cameraRef.current.position.set(0, camY, camZ);
    cameraRef.current.lookAt(targetX, targetY, 0);
  }, [cameraPreset, getCameraTarget]);

  return (
    <div className={cn("relative flex h-full w-full items-center justify-center overflow-hidden", className)}>
      {/* 3D WebGL Canvas Holder */}
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay with Progress Percentage */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm text-white">
          <Loader2 className="size-8 animate-spin text-blue-400" />
          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="text-sm font-semibold">Memuat Model 3D Avatar...</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-200"
                  style={{ width: `${Math.max(loadProgress, 15)}%` }}
                />
              </div>
              <span className="text-xs text-blue-400 font-mono font-bold">
                {loadProgress > 0 ? `${loadProgress}%` : "Mempersiapkan..."}
              </span>
            </div>
            <span className="text-[11px] text-white/50 font-mono">
              {modelUrl.split("/").pop()}
            </span>
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {loadError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-neutral-900/90 p-6 text-center text-white">
          <div className="size-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
            !
          </div>
          <span className="text-xs text-red-300 max-w-xs">{loadError}</span>
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-1.5 text-xs text-white border-white/30 hover:bg-white/10"
          >
            <RefreshCw className="size-3" /> Coba Lagi
          </Button>
        </div>
      )}
    </div>
  );
}
