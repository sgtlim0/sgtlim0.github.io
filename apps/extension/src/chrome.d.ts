/* Minimal Chrome Extension API type declarations for popup */
declare namespace chrome {
  namespace storage {
    interface StorageArea {
      get(
        keys: string | string[],
        callback: (items: Record<string, unknown>) => void
      ): void
      set(items: Record<string, unknown>, callback?: () => void): void
    }
    const local: StorageArea
  }
}
