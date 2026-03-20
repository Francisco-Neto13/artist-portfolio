'use client';
import { Artwork } from '@/components/gallery/types';
import ArtworkCard from './ArtworkCard';

interface GalleryGridProps {
  artworks: Artwork[];
  searchQuery: string;
  isAdmin: boolean;
  onUploadClick: () => void;
  onEdit: (art: Artwork) => void;
  onClick: (art: Artwork, index: number) => void;
  onDelete: () => void;
}

export default function GalleryGrid({
  artworks, searchQuery, isAdmin,
  onUploadClick, onEdit, onClick, onDelete
}: GalleryGridProps) {
  return (
    <main className="w-full px-2 md:px-16 lg:px-24">
      <div className="columns-2 lg:columns-4 xl:columns-5 gap-3 md:gap-4">
        {isAdmin && (
          <div className="break-inside-avoid w-full mb-2 md:mb-4">
            <button
              onClick={onUploadClick}
              className="w-full aspect-[4/3] rounded-xl md:rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-3 md:gap-4 hover:bg-blue-500/[0.03] hover:border-blue-500/20 transition-all group cursor-pointer bg-white/[0.01]"
            >
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-blue-500/20 flex items-center justify-center text-blue-500 text-2xl md:text-3xl font-light group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                +
              </div>
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-600 group-hover:text-blue-400">Upload Art</span>
            </button>
          </div>
        )}

        {artworks.map((art, index) => (
          <div key={art.id} className="break-inside-avoid w-full mb-2 md:mb-3">
            <ArtworkCard
              art={art}
              isAdmin={isAdmin}
              onEdit={() => onEdit(art)}
              onClick={() => onClick(art, index)}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>

      {artworks.length === 0 && (
        <div className="mx-2 md:mx-0 py-24 text-center border-2 border-dashed border-white/[0.02] rounded-3xl">
          <p className="text-slate-600 uppercase tracking-widest text-xs font-bold">
            {searchQuery ? `No artworks found for "${searchQuery}".` : 'No artworks found in this category.'}
          </p>
        </div>
      )}
    </main>
  );
}