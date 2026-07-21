export interface IconRequest {
  query: string;
  exclude?: string[];
  count?: number;
}

/** IconRequest con los opcionales ya resueltos, tal como lo recibe cada proveedor. */
export interface ResolvedIconRequest {
  query: string;
  exclude: string[];
  count: number;
}

/**
 * Proveedor de iconos con IA on-device. El orquestador prueba los proveedores en orden
 * hasta reunir las propuestas pedidas; cada plataforma aporta el suyo (Apple Intelligence
 * en iOS hoy, un proveedor Android a futuro) y el matcher local en español es el respaldo
 * universal. Sumar una plataforma = sumar un IconProvider al registro de icons/index.ts.
 */
export interface IconProvider {
  readonly id: string;
  /** ¿Puede generar en este dispositivo/OS ahora mismo? */
  isAvailable(): Promise<boolean>;
  /** Propone emojis; puede devolver menos de `count` (el orquestador completa con el respaldo). */
  propose(request: ResolvedIconRequest): Promise<string[]>;
}
