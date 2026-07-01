# AI Module

The AI module hosts the reconstruction workflow for CloudClear AI. The current prototype uses a lightweight computer vision pipeline for segmentation and reconstruction, while the architecture is structured for future replacement with U-Net and diffusion-based models.

## Planned Model Stack

- Cloud segmentation: U-Net / DeepLab-style encoder-decoder
- Fusion: cross-attention layer over optical + SAR + multispectral features
- Reconstruction: latent diffusion refinement stage
- Evaluation: PSNR, SSIM, RMSE, SAM, LPIPS, confidence estimation
