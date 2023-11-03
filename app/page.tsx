'use client'

import { SingleImageDropzone } from '@/components/singleImageDropzone'
import { useEdgeStore } from '@/lib/edgestore'
import Link from 'next/link'
import { useState } from 'react'

export default function Page() {
  const [file, setFile] = useState<File>()
  const [progress, setProgress] = useState(0)
  const [urls, setUrls] = useState<{
    url: string
    thumbnailUrl: string | null
  }>()
  const { edgestore } = useEdgeStore()

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center m-6 gap-2">
        <SingleImageDropzone
          width={256}
          height={256}
          value={file}
          dropzoneOptions={{
            maxSize: 1024 * 1024 * 1 // 1MB
          }}
          onChange={file => {
            setFile(file)
          }}
        />
        <div className="h-[6px] w-64 border rounded overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-150"
            style={{
              width: `${progress}%`
            }}
          />
        </div>
        <button
          className="bg-white text-black rounded px-2 hover:opacity-80"
          onClick={async () => {
            if (file) {
              const res = await edgestore.publicImages.upload({
                file,
                input: { type: 'post' },
                onProgressChange: progress => {
                  setProgress(progress)
                }
              })
              setUrls({
                url: res.url,
                thumbnailUrl: res.thumbnailUrl
              })
            }
          }}
        >
          Upload
        </button>
        {urls?.url && (
          <Link href={urls.url} target="_blank">
            URL
          </Link>
        )}
        {urls?.thumbnailUrl && (
          <Link href={urls.thumbnailUrl} target="_blank">
            THUMBNAIL
          </Link>
        )}
      </div>
    </div>
  )
}
