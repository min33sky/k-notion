'use client';

import Image from 'next/image';
import { ImageIcon, X } from 'lucide-react';
import { useMutation } from 'convex/react';
import { useParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCoverImage } from '@/hooks/use-cover-image';
import { Id } from '../../convex/_generated/dataModel';
import { api } from '../../convex/_generated/api';
import { useEdgeStore } from '@/lib/edgestore';

interface CoverImageProps {
  url?: string;
  preview?: boolean;
}

export default function Cover({ url, preview }: CoverImageProps) {
  const { edgestore } = useEdgeStore();
  const params = useParams();
  const coverImage = useCoverImage();
  const removeCoverImage = useMutation(api.documents.removeCoverImage);

  const onRemove = async () => {
    //? Edge Store에 저장된 파일을 직접 삭제하기
    if (url) {
      await edgestore.publicFiles.delete({
        url,
      });
    }

    //? DB에서 이미지 주소 삭제하기
    removeCoverImage({
      id: params.documentId as Id<'documents'>,
    });
  };

  return (
    <div
      className={cn(
        'relative w-full h-[35vh] group',
        !url && 'h-[12vh]',
        url && 'bg-muted',
      )}
    >
      {
        // 커버이미지가 존재한다면 랜더링
        !!url && <Image src={url} fill alt="Cover" className="object-cover" />
      }

      {url && !preview && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2">
          <Button
            onClick={() => coverImage.onReplace(url)}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Change cover
          </Button>
          <Button
            onClick={onRemove}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}
