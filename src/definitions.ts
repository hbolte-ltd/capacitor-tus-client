export interface CapacitorTusClientPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
