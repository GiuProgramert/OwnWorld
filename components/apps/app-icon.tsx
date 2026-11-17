import Image from "next/image";
import type { LucideIcon } from "lucide-react";

type AppIconProps = {
  icon: LucideIcon;
  /** Ruta a una imagen de `public/`; si existe reemplaza al icono. */
  logo?: string;
  /** Lado en píxeles, igual para el logo y para el icono. */
  size: number;
  /** Texto alternativo del logo; vacío si el nombre ya está como texto al lado. */
  alt?: string;
  className?: string;
};

export default function AppIcon({
  icon: Icon,
  logo,
  size,
  alt = "",
  className,
}: AppIconProps) {
  if (logo) {
    return (
      <Image
        src={logo}
        alt={alt}
        width={size}
        height={size}
        className={className}
      />
    );
  }

  return <Icon size={size} className={className} aria-hidden />;
}
