/**
 * Interfaces comunes para componentes de UI
 * Reutilizables en todo el proyecto
 */

/**
 * Interface para definir columnas de tablas
 */
export interface TableColumn {
  field: string;
  header: string;
}

/**
 * Interface para items de menú contextual o dropdown
 */
export interface MenuItem {
  value: string;
  label: string;
  icon: string;
  command: () => void;
  visible?: boolean;
}
