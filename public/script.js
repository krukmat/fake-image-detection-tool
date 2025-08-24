document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('detectionForm');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const error = document.getElementById('error');
    const originalUrlInput = document.getElementById('originalUrl');
    const suspectUrlInput = document.getElementById('suspectUrl');
    const originalPreview = document.getElementById('originalPreview');
    const suspectPreview = document.getElementById('suspectPreview');

    originalUrlInput.addEventListener('input', updatePreview);
    suspectUrlInput.addEventListener('input', updatePreview);

    function updatePreview() {
        if (originalUrlInput.value) {
            originalPreview.src = originalUrlInput.value;
            originalPreview.classList.remove('hidden');
            originalPreview.onerror = () => originalPreview.classList.add('hidden');
        } else {
            originalPreview.classList.add('hidden');
        }

        if (suspectUrlInput.value) {
            suspectPreview.src = suspectUrlInput.value;
            suspectPreview.classList.remove('hidden');
            suspectPreview.onerror = () => suspectPreview.classList.add('hidden');
        } else {
            suspectPreview.classList.add('hidden');
        }
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const originalUrl = formData.get('originalUrl');
        const suspectUrl = formData.get('suspectUrl');

        hideAllMessages();
        showLoading();

        try {
            const response = await fetch('/api/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url_original: originalUrl,
                    url_suspect: suspectUrl
                })
            });

            const data = await response.json();

            hideLoading();

            if (response.ok) {
                displayResults(data);
            } else {
                displayError(data.error || 'Analysis failed');
            }
        } catch (err) {
            hideLoading();
            displayError('Network error: Unable to connect to the server');
        }
    });

    function showLoading() {
        loading.classList.remove('hidden');
    }

    function hideLoading() {
        loading.classList.add('hidden');
    }

    function hideAllMessages() {
        results.classList.add('hidden');
        error.classList.add('hidden');
    }

    function displayResults(data) {
        const resultContent = document.getElementById('resultContent');
        
        const manipulationStatus = data.manipulated ? 'Manipulation Detected' : 'No Manipulation Detected';
        const statusClass = data.manipulated ? 'manipulation-detected' : 'manipulation-not-detected';
        
        resultContent.innerHTML = `
            <div class="result-item ${statusClass}">
                <h3>${manipulationStatus}</h3>
            </div>
            <div class="result-item">
                <strong>Similarity Score:</strong> ${data.score} (${(data.score * 100).toFixed(2)}%)
            </div>
            <div class="result-item">
                <strong>Analysis:</strong> ${data.message}
            </div>
            <div class="result-item">
                <strong>Media Type:</strong> ${data.media_type}
            </div>
            <div class="result-item">
                <strong>Original Dimensions:</strong> ${data.original_dimensions[0]} × ${data.original_dimensions[1]}
            </div>
            <div class="result-item">
                <strong>Suspect Dimensions:</strong> ${data.suspect_dimensions[0]} × ${data.suspect_dimensions[1]}
            </div>
        `;
        
        results.classList.remove('hidden');
    }

    function displayError(errorMessage) {
        const errorContent = document.getElementById('errorContent');
        errorContent.textContent = errorMessage;
        error.classList.remove('hidden');
    }
});