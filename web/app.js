class ImageProcessor {
    constructor() {
        this.images = new Map();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const processBtn = document.getElementById('processBtn');
        const downloadBtn = document.getElementById('downloadBtn');

        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        processBtn.addEventListener('click', () => this.processImages());
        downloadBtn.addEventListener('click', () => this.downloadResults());
    }

    handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const id = crypto.randomUUID();
                this.images.set(id, {
                    file,
                    status: 'pending',
                    caption: '',
                });
                this.displayImage(id, file);
            }
        });

        document.getElementById('processBtn').disabled = this.images.size === 0;
    }

    displayImage(id, file) {
        const imageList = document.getElementById('imageList');
        const card = document.createElement('div');
        card.className = 'image-card bg-white rounded-lg shadow-lg overflow-hidden';
        card.id = `card-${id}`;

        const reader = new FileReader();
        reader.onload = (e) => {
            card.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="font-semibold text-lg mb-2">${file.name}</h3>
                    <div class="caption text-sm text-gray-600"></div>
                </div>
            `;
        };
        reader.readAsDataURL(file);

        imageList.appendChild(card);
    }

    async processImages() {
        const processBtn = document.getElementById('processBtn');
        processBtn.disabled = true;

        for (const [id, image] of this.images.entries()) {
            if (image.status !== 'pending') continue;

            const card = document.getElementById(`card-${id}`);
            card.innerHTML += `
                <div class="progress-overlay">
                    <div class="text-center">
                        <div class="mb-2">Traitement en cours...</div>
                        <div class="h-2 w-48 bg-gray-200 rounded-full">
                            <div class="progress-bar h-full bg-blue-500 rounded-full" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            `;

            try {
                // Simuler le traitement pour le moment
                await this.processImage(id);
            } catch (error) {
                console.error('Error processing image:', error);
                image.status = 'error';
                image.caption = 'Erreur lors du traitement';
            }
        }

        document.getElementById('downloadBtn').disabled = false;
    }

    async processImage(id) {
        const image = this.images.get(id);
        const progressBar = document.querySelector(`#card-${id} .progress-bar`);

        // Simuler le redimensionnement
        await this.updateProgress(progressBar, 30);
        
        // Simuler la génération de légende avec GPT-4
        await this.updateProgress(progressBar, 60);
        
        // Simuler la modification avec Mistral
        await this.updateProgress(progressBar, 100);

        // Pour le moment, on met une légende de test
        image.caption = "Une légende générée automatiquement pour cette image.";
        image.status = 'completed';

        const captionDiv = document.querySelector(`#card-${id} .caption`);
        captionDiv.textContent = image.caption;

        // Retirer l'overlay de progression
        const overlay = document.querySelector(`#card-${id} .progress-overlay`);
        overlay.remove();
    }

    async updateProgress(progressBar, percentage) {
        progressBar.style.width = `${percentage}%`;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    downloadResults() {
        const zip = new JSZip();
        const promises = [];

        for (const [id, image] of this.images.entries()) {
            if (image.status === 'completed') {
                const promise = new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const filename = image.file.name;
                        zip.file(filename, e.target.result.split(',')[1], {base64: true});
                        zip.file(`${filename}.txt`, image.caption);
                        resolve();
                    };
                    reader.readAsDataURL(image.file);
                });
                promises.push(promise);
            }
        }

        Promise.all(promises).then(() => {
            zip.generateAsync({type: 'blob'}).then((content) => {
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'joy-caption-results.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        });
    }
}

// Initialiser l'application
new ImageProcessor();
