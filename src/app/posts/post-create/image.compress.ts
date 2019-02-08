import { Observable } from "rxjs";

export const imageCompress = (file: File) => {
    const width = 600; // For scaling relative to width
    const reader = new FileReader();
    reader.readAsDataURL(file);
    let mimeType = file.type;
    return new Observable<{file: File, preview: string}>(observer => {
      reader.onload = ev => {
        const img = new Image();
        img.src = (ev.target as any).result;
        if(mimeType == 'image/gif') {
          observer.next({
            file: file,
            preview: img.src
          });
        }else{
          img.onload = () =>{
            const elem = document.createElement('canvas'); // Use Angular's Renderer2 method
            const scaleFactor = width / img.width;
            elem.width = width;
            elem.height = img.height * scaleFactor;
            const ctx = <CanvasRenderingContext2D>elem.getContext('2d');
            ctx.drawImage(img, 0, 0, width, img.height * scaleFactor);
            ctx.canvas.toBlob(
              blob => {
                observer.next({
                  file: new File([blob], file.name, {
                    type: 'image/png',
                    lastModified: Date.now(),
                  }),
                  preview: img.src
                });
              },
              'image/png',
              1
            );
          };
          img.onerror = error => observer.error(error);
        }
      };
      reader.onerror = error => observer.error(error);
    });
  }
