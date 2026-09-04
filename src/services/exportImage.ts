import html2canvas from 'html2canvas';

export const exportarElementoAImagenJpg = async (
  elementoId: string,
  nombreArchivo: string = 'Comprobante_ISSSTE'
): Promise<boolean> => {
  try {
    const elemento = document.getElementById(elementoId);
    if (!elemento) {
      console.warn(`Elemento con ID "${elementoId}" no encontrado para captura.`);
      return false;
    }

    const canvas = await html2canvas(elemento, {
      scale: 2, // Alta resolución Retina
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFFFFF',
      logging: false,
    });

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${nombreArchivo}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (err) {
    console.error('Error generando imagen JPG:', err);
    return false;
  }
};
