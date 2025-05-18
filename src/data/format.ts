// TODO support line wrapping (space-seperated, keys-values etc)
export class Format {
  static boolean({ value }: { value: boolean }): "true" | "false" {
    return value ? "true" : "false";
  }

  static sepSpace({ values }: { values: string[] }): string {
    return values.join(" ");
  }

  static mapping({
    host,
    container = "",
    permissions = [],
    ifExists = false,
  }: {
    host: string;
    container?: string;
    permissions?: string[];
    ifExists?: boolean;
  }): string {
    // Remove duplicates
    permissions = [...new Set(permissions)];

    const permissionString =
      permissions.length > 0 ? `:${permissions.join("")}` : "";

    container = container ? `:${container}` : "";
    return `${ifExists ? "-" : ""}${host}${container}${permissionString}`;
  }

  static pair({ values }: { values: Record<string, string> }): string {
    return Object.entries(values)
      .map(([key, value]) =>
        value.includes(" ") ? `"${key}=${value}"` : `${key}=${value}`
      )
      .join(" ");
  }
}
