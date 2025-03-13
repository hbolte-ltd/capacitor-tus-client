import { CapacitorTusClient, ListenerType } from '@hbolte/capacitor-tus-client';
import {FilePicker} from "@capawesome/capacitor-file-picker";

// Replace with your own configuration
const endpoint = '<your-endpoint>';
const headers = {
    Authorization: 'Bearer <your-token>',
    "x-upsert": "true",
}
const bucketName = '<your-bucket-name>';
const dir = `<your-dir-name>`;
const cacheControl = '3600';
const chunkSize = 1024 * 1024 * 6;

// UI components
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const pauseButton = document.getElementById('pauseButton');
const abortButton = document.getElementById('abortButton');
const progressBarInner = document.getElementById('progressBarInner');
const progressPercentage = document.getElementById('progressPercentage');
const chooseFileButton = document.querySelector("button[onclick='pickFile()']");

let selectedFile = null;
let activeUploadId = null;
let isPaused = false;

const mimeMap = {
    'video/mp4': 'mp4',
    'video/mpeg': 'mpeg',
    'video/x-msvideo': 'avi',
    'video/x-ms-wmv': 'wmv',
    'video/quicktime': 'mov',
    'video/x-flv': 'flv',
    'video/webm': 'webm',
    'video/x-m4v': 'm4v',
    'video/3gpp': '3gp',
    'video/ogg': 'ogv'
};

const getExtensionFromMimeType = (mimeType) => mimeMap[mimeType] || 'bin';

window.pickFile = async () => {
    try {
        const pickFiles = await FilePicker.pickFiles({
            types: Object.keys(mimeMap),
        });

        const file = pickFiles?.files?.length > 0 ? pickFiles.files[0] : null;

        if (!file || !file.path) {
            alert('No file selected.');
            return;
        }

        selectedFile = file;
        fileInput.value = selectedFile.name;
        uploadButton.disabled = false;
        abortButton.disabled = true;
        pauseButton.disabled = true;
    } catch (error) {
        alert('Failed to pick a file. Please try again.');
        console.error('Error picking file:', error);
    }
};

window.uploadFile = async () => {
    if (!selectedFile) {
        alert('No file selected for upload.');
        return;
    }

    try {
        chooseFileButton.disabled = true;

        const uploadId = await CapacitorTusClient.upload({
            options: {
                uri: selectedFile.path,
                endpoint: endpoint,
                headers: headers,
                metadata: {
                    bucketName: bucketName,
                    objectName: `${dir}/example-${Date.now()}.${getExtensionFromMimeType(selectedFile.mimeType)}`,
                    contentType: selectedFile.mimeType,
                    cacheControl: cacheControl
                },
                chunkSize: chunkSize
            },
        });

        activeUploadId = uploadId.uploadId;

        uploadButton.disabled = true;
        abortButton.disabled = false;
        pauseButton.disabled = false;

        CapacitorTusClient.addListener(ListenerType.OnProgress, (data) => {
            if (data.uploadId === activeUploadId) {
                const progress = data.progress.toFixed(2);
                progressBarInner.style.width = `${progress}%`;
                progressPercentage.textContent = `Progress: ${progress}%`;
            }
        });

        CapacitorTusClient.addListener(ListenerType.OnSuccess, (data) => {
            if (data.uploadId === activeUploadId) {
                alert(`Upload complete! File URL: ${data.uploadUrl}`);
                resetUI();
            }
        });

        CapacitorTusClient.addListener(ListenerType.OnError, (data) => {
            if (data.uploadId === activeUploadId) {
                alert(`Upload failed. Error: ${data.error}`);
                resetUI();
            }
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload the file. Please try again.');
        resetUI();
    }
};

window.pauseResumeUpload = async () => {
    if (!activeUploadId) {
        alert('No active upload to pause or resume.');
        return;
    }

    try {
        if (isPaused) {
            await CapacitorTusClient.resume({ uploadId: activeUploadId });
            pauseButton.textContent = 'Pause Upload';
            isPaused = false;
        } else {
            await CapacitorTusClient.pause({ uploadId: activeUploadId });
            pauseButton.textContent = 'Resume Upload';
            isPaused = true;
        }
    } catch (error) {
        alert(`Failed to ${isPaused ? 'resume' : 'pause'} the upload. Please try again.`);
        console.error(`Error ${isPaused ? 'resuming' : 'pausing'} upload:`, error);
    }
};

window.abortUpload = async () => {
    if (!activeUploadId) {
        alert('No active upload to abort.');
        return;
    }

    try {
        await CapacitorTusClient.abort({ uploadId: activeUploadId });
        alert('Upload aborted successfully.');
        resetUI();
    } catch (error) {
        alert('Failed to abort the upload. Please try again.');
        console.error('Error aborting upload:', error);
    }
};

const resetUI = () => {
    uploadButton.disabled = true;
    abortButton.disabled = true;
    pauseButton.disabled = true;
    chooseFileButton.disabled = false;

    activeUploadId = null;
    isPaused = false;
    progressBarInner.style.width = '0%';
    progressPercentage.textContent = 'Progress: 0%';
    fileInput.value = '';
    selectedFile = null;
    pauseButton.textContent = 'Pause Upload';

};
