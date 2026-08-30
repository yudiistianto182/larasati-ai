import {
  Activity,
  Database,
  LayoutDashboard,
  Radio,
  Settings,
  Trophy,
  Tv,
} from "lucide-react";
import type { NavGroup } from "./sidebar-items";

export const mainDashboardSidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Midwife Admin",
    items: [
      {
        id: "midwife-default",
        title: "Default Dashboard",
        url: "/dashboard/admin-default",
        icon: LayoutDashboard,
      },
      {
        id: "midwife-liveview",
        title: "Liveview Sirkuit",
        url: "/liveview",
        icon: Tv,
        badge: "live",
      },
    ],
  },
  {
    id: 2,
    label: "System Management",
    items: [
      {
        id: "midwife-system",
        title: "System",
        icon: Settings,
        subItems: [
          { id: "midwife-users", title: "User", url: "/dashboard/system/user" },
          { id: "midwife-roles", title: "Role", url: "/dashboard/system/role" },
        ],
      },
      {
        id: "midwife-master",
        title: "Master",
        icon: Database,
        subItems: [
          { id: "midwife-periode", title: "Periode", url: "/dashboard/master/periode" },
          { id: "midwife-kasus", title: "Kasus", url: "/dashboard/master/kasus" },
          { id: "midwife-pasien", title: "Pasien", url: "/dashboard/master/pasien" },
        ],
      },
      {
        id: "midwife-contest",
        title: "Lomba",
        url: "/dashboard/contest",
        icon: Trophy,
      },
    ],
  },
];

export const midwifeSidebarItems = mainDashboardSidebarItems;
