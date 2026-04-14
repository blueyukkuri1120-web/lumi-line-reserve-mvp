export function withBasePath(basePath: string | undefined, path: string) {
  if (!basePath || basePath === "/") {
    return path;
  }

  const normalizedBasePath = basePath.startsWith("/") ? basePath : `/${basePath}`;

  if (path === "/") {
    return normalizedBasePath;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBasePath}${normalizedPath}`;
}
