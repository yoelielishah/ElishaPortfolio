/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type { UIMessage } from "ai"
import cx from "classnames"
import type React from "react"
import { useRef, useEffect, useState, useCallback, type ChangeEvent, memo } from "react"
import { toast } from "sonner"
import { useLocalStorage, useWindowSize } from "usehooks-ts"

import { ArrowUpIcon, StopIcon } from "../ui/icons"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SuggestedActions } from "../../components/chat/suggested-actions"
import type { UseChatHelpers } from "@ai-sdk/react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowDown } from "lucide-react"
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom"

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
}: {
  chatId: string
  input: UseChatHelpers["input"]
  setInput: UseChatHelpers["setInput"]
  status: UseChatHelpers["status"]
  stop: () => void
  messages: Array<UIMessage>
  setMessages: UseChatHelpers["setMessages"]
  append: UseChatHelpers["append"]
  handleSubmit: UseChatHelpers["handleSubmit"]
  className?: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { width } = useWindowSize()

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight()
    }
  }, [])

  const adjustHeight = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current

      textarea.style.height = "auto"

      const maxHeight = Math.floor(window.innerHeight * 0.47)

      const scrollHeight = textarea.scrollHeight

      const newHeight = Math.min(scrollHeight + 2, maxHeight)
      textarea.style.height = `${newHeight}px`

      if (scrollHeight + 2 > maxHeight) {
        textarea.style.overflowY = "auto"
      } else {
        textarea.style.overflowY = "hidden"
      }
    }
  }

  const resetHeight = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      textarea.style.height = "auto"
      const lineHeight = 24
      const minHeight = lineHeight * 2 + 16
      textarea.style.height = `${minHeight}px`
      textarea.style.overflowY = "hidden"
    }
  }

  const [localStorageInput, setLocalStorageInput] = useLocalStorage("input", "")

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || ""
      setInput(finalValue)
      adjustHeight()
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setLocalStorageInput(input)
  }, [input, setLocalStorageInput])

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value)
    adjustHeight()
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([])

  const submitForm = useCallback(() => {
    // window.history.replaceState({}, '', `/chat/${chatId}`);

    handleSubmit(undefined)

    setLocalStorageInput("")
    resetHeight()

    if (width && width > 768) {
      textareaRef.current?.focus()
    }
  }, [handleSubmit, setLocalStorageInput, width])

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const { url, pathname, contentType } = data

        return {
          url,
          name: pathname,
          contentType: contentType,
        }
      }
      const { error } = await response.json()
      toast.error(error)
    } catch (error) {
      toast.error("Failed to upload file, please try again!")
    }
  }

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || [])

      setUploadQueue(files.map((file) => file.name))

      try {
        const uploadPromises = files.map((file) => uploadFile(file))
        await Promise.all(uploadPromises)
      } catch (error) {
        console.error("Error uploading files!", error as Error)
      } finally {
        setUploadQueue([])
      }
    },
    [setUploadQueue],
  )

  const { isAtBottom, scrollToBottom } = useScrollToBottom()

  useEffect(() => {
    if (status === "submitted") {
      scrollToBottom()
    }
  }, [status, scrollToBottom])

  return (
    <div className="relative w-full flex flex-col gap-4">
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute left-1/2 bottom-28 -translate-x-1/2 z-50"
          >
            <Button
              data-testid="scroll-to-bottom-button "
              className="rounded-full"
              size="icon"
              variant="outline"
              onClick={(event) => {
                event.preventDefault()
                scrollToBottom()
              }}
            >
              <ArrowDown />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {messages.length === 0 && uploadQueue.length === 0 && <SuggestedActions append={append} chatId={chatId} />}

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      <Textarea
        data-testid="multimodal-input"
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        className={cx(
          "min-h-[24px] max-h-[calc(75vh)] max-sm:w-[calc(100vw-40px)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 border-2 border-white dark:border-zinc-700 shadow-lg whitespace-pre-wrap break-words",
          className,
        )}
        rows={2}
        autoFocus
        style={{
          wordWrap: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap",
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault()

            if (status !== "ready") {
              toast.error("Please wait for the model to finish its response!")
            } else {
              submitForm()
            }
          }
        }}
      />

      <div className="absolute bottom-0 right-6 sm:right-0 p-2 w-fit flex flex-row justify-end">
        {status === "submitted" ? (
          <StopButton stop={stop} setMessages={setMessages} />
        ) : (
          <SendButton input={input} submitForm={submitForm} uploadQueue={uploadQueue} />
        )}
      </div>
    </div>
  )
}

export const MultimodalInput = memo(PureMultimodalInput, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false
  if (prevProps.status !== nextProps.status) return false

  return true
})

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void
  setMessages: UseChatHelpers["setMessages"]
}) {
  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault()
        stop()
        setMessages((messages) => messages)
      }}
    >
      <StopIcon size={14} />
    </Button>
  )
}

const StopButton = memo(PureStopButton)

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void
  input: string
  uploadQueue: Array<string>
}) {
  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault()
        submitForm()
      }}
      disabled={input.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={14} />
    </Button>
  )
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length) return false
  if (prevProps.input !== nextProps.input) return false
  return true
})