// Logo de FAGOR en base64 para usar en PDF y Excel
// Generado desde: client/public/fagor-logo.jpg

export async function getLogoBase64(): Promise<string> {
  try {
    const response = await fetch('/fagor-logo.jpg');
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading logo:', error);
    return '';
  }
}

// Función síncrona para obtener logo (sin imagen, solo placeholder)
export function getLogoPlaceholder(): string {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiIGZpbGw9IiNEQzFFMjYiLz48dGV4dCB4PSIxMDAiIHk9IjMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GQUdPUjwvdGV4dD48L3N2Zz4=';
}
