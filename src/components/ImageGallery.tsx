import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PropertyImage {
  id: string;
  image_url: string;
  is_cover: boolean;
  alt_text: string | null;
  sort_order: number;
}

interface ImageGalleryProps {
  images: PropertyImage[];
  title: string;
}

const ImageGallery = ({ images, title }: ImageGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setIsOpen(true);
  };

  const goToPrevious = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      {/* Galerie principale */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {/* Image principale */}
        <div className="col-span-2 row-span-2 relative">
          <img
            src={images[0]?.image_url}
            alt={images[0]?.alt_text || title}
            className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-l-lg cursor-pointer hover:brightness-110 transition-all"
            onClick={() => openLightbox(0)}
          />
        </div>
        
        {/* Images secondaires */}
        <div className="col-span-2 grid grid-cols-2 gap-2">
          {images.slice(1, 5).map((image, index) => (
            <div key={image.id} className="relative">
              <img
                src={image.image_url}
                alt={image.alt_text || title}
                className={`w-full h-32 md:h-40 lg:h-48 object-cover cursor-pointer hover:brightness-110 transition-all ${
                  index === 1 ? 'rounded-tr-lg' : index === 3 ? 'rounded-br-lg' : ''
                }`}
                onClick={() => openLightbox(index + 1)}
              />
              {/* Overlay pour la dernière image s'il y en a plus */}
              {index === 3 && images.length > 5 && (
                <div 
                  className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold text-lg cursor-pointer rounded-br-lg"
                  onClick={() => openLightbox(index + 1)}
                >
                  +{images.length - 5} photos
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Lightbox */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl w-full h-[90vh] p-0 bg-black">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Bouton fermer */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Boutons navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-10 text-white hover:bg-white/20"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-10 text-white hover:bg-white/20"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Image principale */}
            <img
              src={images[selectedImageIndex]?.image_url}
              alt={images[selectedImageIndex]?.alt_text || title}
              className="max-w-full max-h-full object-contain"
            />

            {/* Indicateur */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Miniatures */}
            {images.length > 1 && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-xl overflow-x-auto p-2">
                {images.map((image, index) => (
                  <img
                    key={image.id}
                    src={image.image_url}
                    alt={image.alt_text || title}
                    className={`w-16 h-16 object-cover rounded cursor-pointer transition-all ${
                      index === selectedImageIndex ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery;