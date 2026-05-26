// src/services/cloudinary.js
const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const uploadToCloudinary = async (file, onProgress, resourceType = 'video') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('resource_type', resourceType)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText)
      if (xhr.status === 200) resolve(res)
      else reject(new Error(res.error?.message || 'Upload failed'))
    }

    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(formData)
  })
}

export const getCloudinaryUrl = (publicId, transforms = '') => {
  const base = `https://res.cloudinary.com/${CLOUD_NAME}`
  if (!publicId) return ''
  if (transforms) return `${base}/image/upload/${transforms}/${publicId}`
  return `${base}/image/upload/${publicId}`
}

export const getVideoUrl = (publicId) =>
  `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${publicId}`

export const getThumbnailFromVideo = (publicId) =>
  `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_0,w_640,h_360,c_fill,f_jpg/${publicId}`
