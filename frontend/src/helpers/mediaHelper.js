import { CLOUDINARY_CONFIG } from '../../config/cloudinary.mjs';
import { fetchJson } from '@/libs/fetchJson.js';
import { getAuthHeaders } from '@/helpers/authHelper.js';

/**
 * Upload une image vers Cloudinary (fonction interne)
 * @param {File} file - Le fichier à uploader
 * @param {Object} options - Options optionnelles
 * @param {string} options.folder - Dossier de destination
 * @param {string} options.publicId - ID public personnalisé
 * @returns {Promise<Object>} { url: string, publicId: string }
 */
async function uploadToCloudinary(file, options = {}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

  if (options.folder) {
    formData.append('folder', options.folder);
  }
  if (options.publicId) {
    formData.append('public_id', options.publicId);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur upload Cloudinary: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error('Erreur lors de l\'upload Cloudinary:', error);
    throw error;
  }
}

/**
 * Ajoute une URL de média à une activité
 * @param {string} activityId - ID de l'activité
 * @param {string} mediaUrl - URL du média (depuis Cloudinary)
 * @returns {Promise<Object>} Réponse du serveur
 */
async function addMediaToActivity(activityId, mediaUrl) {
  const { request } = fetchJson({
    url: `/api/medias/${activityId}/`,
    method: 'POST',
    data: { mediaUrl },
    headers: getAuthHeaders(),
  });
  return request;
}

/**
 * Récupère tous les médias d'une activité
 * @param {string} activityId - ID de l'activité
 * @returns {Promise<Array>} Liste des médias
 */
export async function getActivityMedias(activityId) {
  const { request } = fetchJson({
    url: `/api/medias/${activityId}`,
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return request;
}

/**
 * Récupère tous les médias de l'utilisateur (toutes activités confondues)
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} Liste des médias
 */
export async function getUserMedias() {
  const { request } = fetchJson({
    url: `/api/medias/all`,
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return request;
}

/**
 * Supprime un média d'une activité
 * @param {string} activityId - ID de l'activité
 * @param {string} mediaUrl - URL du média à supprimer
 * @returns {Promise<Object>} Réponse du serveur
 */
export async function deleteMediaFromActivity(activityId, mediaUrl) {
  const { request } = fetchJson({
    url: `/api/medias/${activityId}/`,
    method: 'DELETE',
    data: { mediaUrl },
    headers: getAuthHeaders(),
  });
  return request;
}

/**
 * Workflow complet: Upload sur Cloudinary puis ajout à l'activité
 * @param {File} file - Le fichier à uploader
 * @param {string} activityId - ID de l'activité
 * @param {Object} options - Options optionnelles pour Cloudinary
 * @returns {Promise<Object>} { mediaUrl: string, activityResponse: Object }
 */
export async function uploadAndAddMediaToActivity(file, activityId, options = {}) {
  try {
    // Étape 1: Upload sur Cloudinary
    const { url: mediaUrl } = await uploadToCloudinary(file, options);

    // Étape 2: Ajouter à l'activité via le backend
    const activityResponse = await addMediaToActivity(activityId, mediaUrl);

    return {
      mediaUrl,
      activityResponse,
    };
  } catch (error) {
    console.error('Erreur lors du workflow upload:', error);
    throw error;
  }
}
