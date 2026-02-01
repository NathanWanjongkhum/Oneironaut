class AssetManager {
  constructor() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = {};
    this.downloadQueue = [];
  }

  queueDownload(path) {
    this.downloadQueue.push(path);
  }

  isDone() {
    return this.downloadQueue.length === this.successCount + this.errorCount;
  }

  downloadAll(callback) {
    if (this.downloadQueue.length === 0) callback();

    for (const path of this.downloadQueue) {
      const img = new Image();
      img.onload = () => {
        this.successCount++;
        this.cache[path] = img;
        if (this.isDone()) callback();
      };
      img.onerror = () => {
        this.errorCount++;
        console.error("Failed to load:", path);
        if (this.isDone()) callback();
      };
      img.src = path;
    }
  }

  getAsset(path) {
    return this.cache[path];
  }
}
