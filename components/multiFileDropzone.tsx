'use client'

import {
  CheckCircleIcon,
  FileIcon,
  LucideFileWarning,
  Trash2Icon,
  UploadCloudIcon
} from 'lucide-react'
import * as React from 'react'
import { DropzoneOptions, useDropzone } from 'react-dropzone'
import { twMerge } from 'tailwind-merge'

const variants = {
  base: 'relative rounded-md p-4 w-96 flex justify-center items-center flex-col cursor-pointer border border-dashed border-gray-300 transition-colors duration-200 ease-in-out',
  active: 'border-2',
  disabled:
    'bg-gray-700 border-white/20 cursor-default pointer-events-none bg-opacity-30',
  accept: 'border border-blue-500 bg-blue-500 bg-opacity-10',
  reject: 'border border-red-700 bg-red-700 bg-opacity-10'
}

export type FileState = {
  file: File
  key: string
  progress: 'PENDING' | 'COMPLETE' | 'ERROR' | number
}

type InputProps = {
  className?: string
  value?: FileState[]
  onChange?: (files: FileState[]) => void | Promise<void>
  onFilesAdded?: (addedFiles: FileState[]) => void | Promise<void>
  disabled?: boolean
  dropzoneOptions?: Omit<DropzoneOptions, 'disabled'>
}

const ERROR_MESSAGES = {
  fileTooLarge(maxSize: number) {
    return `The file is too large. Max size is ${formatFileSize(maxSize)}.`
  },
  fileInvalidType() {
    return 'Invalid file type.'
  },
  tooManyFiles(maxFiles: number) {
    return `You can only add ${maxFiles} file(s).`
  },
  fileNotSupported() {
    return 'The file is not supported.'
  }
}

const MultiFileDropzone = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { dropzoneOptions, value, className, disabled, onFilesAdded, onChange },
    ref
  ) => {
    const [customError, setCustomError] = React.useState<string>()
    if (dropzoneOptions?.maxFiles && value?.length) {
      disabled = disabled ?? value.length >= dropzoneOptions.maxFiles
    }
    const {
      getRootProps,
      getInputProps,
      fileRejections,
      isFocused,
      isDragAccept,
      isDragReject
    } = useDropzone({
      disabled,
      onDrop: acceptedFiles => {
        const files = acceptedFiles
        setCustomError(undefined)
        if (
          dropzoneOptions?.maxFiles &&
          (value?.length ?? 0) + files.length > dropzoneOptions.maxFiles
        ) {
          setCustomError(ERROR_MESSAGES.tooManyFiles(dropzoneOptions.maxFiles))
          return
        }
        if (files) {
          const addedFiles = files.map<FileState>(file => ({
            file,
            key: Math.random().toString(36).slice(2),
            progress: 'PENDING'
          }))
          void onFilesAdded?.(addedFiles)
          void onChange?.([...(value ?? []), ...addedFiles])
        }
      },
      ...dropzoneOptions
    })

    const dropZoneClassName = React.useMemo(
      () =>
        twMerge(
          variants.base,
          isFocused && variants.active,
          disabled && variants.disabled,
          (isDragReject ?? fileRejections[0]) && variants.reject,
          isDragAccept && variants.accept,
          className
        ).trim(),
      [
        isFocused,
        fileRejections,
        isDragAccept,
        isDragReject,
        disabled,
        className
      ]
    )

    const errorMessage = React.useMemo(() => {
      if (fileRejections[0]) {
        const { errors } = fileRejections[0]
        if (errors[0]?.code === 'file-too-large') {
          return ERROR_MESSAGES.fileTooLarge(dropzoneOptions?.maxSize ?? 0)
        } else if (errors[0]?.code === 'file-invalid-type') {
          return ERROR_MESSAGES.fileInvalidType()
        } else if (errors[0]?.code === 'too-many-files') {
          return ERROR_MESSAGES.tooManyFiles(dropzoneOptions?.maxFiles ?? 0)
        } else {
          return ERROR_MESSAGES.fileNotSupported()
        }
      }
      return undefined
    }, [fileRejections, dropzoneOptions])

    return (
      <div>
        <div className="flex flex-col gap-2">
          <div>
            <div
              {...getRootProps({
                className: dropZoneClassName
              })}
            >
              <input ref={ref} {...getInputProps()} />
              <div className="flex flex-col items-center justify-center text-xs text-gray-400 p-16">
                <UploadCloudIcon className="mb-1 h-7 w-7" />
                <div className="text-gray-400">
                  drag & drop or click to upload
                </div>
              </div>
            </div>

            <div className="mt-1 text-xs text-red-500">
              {customError ?? errorMessage}
            </div>
          </div>

          {value?.map(({ file, progress }, i) => (
            <div
              key={i}
              className="flex h-16 w-96 flex-col justify-center rounded border border-solid border-white/50 px-4 py-2"
            >
              <div className="flex items-center gap-2 text-white">
                <FileIcon size="30" className="shrink-0" />
                <div className="min-w-0 text-sm">
                  <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">
                    {file.name}
                  </div>
                  <div className="text-xs text-white/70">
                    {formatFileSize(file.size)}
                  </div>
                </div>
                <div className="grow" />
                <div className="flex w-12 justify-end text-xs">
                  {progress === 'PENDING' ? (
                    <button
                      className="rounded-md border-none bg-transparent p-1 transition-colors duration-200 hover:bg-white/30"
                      onClick={() => {
                        void onChange?.(value.filter((_, index) => index !== i))
                      }}
                    >
                      <Trash2Icon className="shrink-0" />
                    </button>
                  ) : progress === 'ERROR' ? (
                    <LucideFileWarning className="shrink-0 text-red-400" />
                  ) : progress !== 'COMPLETE' ? (
                    <div>{Math.round(progress)}%</div>
                  ) : (
                    <CheckCircleIcon className="shrink-0" />
                  )}
                </div>
              </div>
              {typeof progress === 'number' && (
                <div className="relative h-0">
                  <div className="absolute top-1 h-1 w-full overflow-clip rounded-full bg-white/30">
                    <div
                      className="h-full bg-white transition-all duration-300 ease-in-out"
                      style={{
                        width: progress ? `${progress}%` : '0%'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }
)
MultiFileDropzone.displayName = 'MultiFileDropzone'

function formatFileSize(bytes?: number) {
  if (!bytes) {
    return '0 Bytes'
  }
  bytes = Number(bytes)
  if (bytes === 0) {
    return '0 Bytes'
  }
  const k = 1024
  const dm = 2
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export { MultiFileDropzone }
