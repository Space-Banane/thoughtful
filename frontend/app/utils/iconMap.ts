import { 
  Lightbulb, 
  Rocket, 
  BookOpen, 
  Heart, 
  Code, 
  Palette, 
  Music, 
  Camera, 
  Zap, 
  Star, 
  Trophy, 
  Target,
  type LucideIcon 
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  Lightbulb,
  Rocket,
  BookOpen,
  Book: BookOpen,
  Heart,
  Code,
  Palette,
  Music,
  Camera,
  Zap,
  Star,
  Trophy,
  Target,
};

export function getIconFromName(name: string): LucideIcon {
  return iconMap[name] || Lightbulb;
}

export function getIconName(icon: LucideIcon): string {
  const entry = Object.entries(iconMap).find(([_, value]) => value === icon);
  return entry ? entry[0] : "Lightbulb";
}
