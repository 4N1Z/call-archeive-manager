import React, { useState } from 'react';
import { X, Save, Loader2, CheckCircle } from 'lucide-react';
import AudioRecorder from './AudioRecorder';
import { uploadAudioToS3, generateAudioFilename } from '../services/s3Service';
import { addRecording, NewRecordingData } from '../services/recordingService';
import { MOCK_WORKGROUPS } from '../constants';

interface AddRecordingFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddRecordingForm: React.FC<AddRecordingFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<NewRecordingData>({
    recordingid: '',
    mediatype: 'audio',
    recordingtype: 'call',
    filepath: '',
    recordingdate: new Date().toISOString().split('T')[0],
    filesize: 0,
    direction: '',
    firstparticipant: '',
    otherparticipants: '',
    toconnection: '',
    fromconnection: '',
    tags: '',
    attributes: '',
    dnis: '',
    duration: 0,
    workgroup: '',
    ani: '',
  });

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    setFormData(prev => ({ ...prev, filesize: blob.size }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!audioBlob) {
      setError('Please record or upload an audio file');
      return;
    }

    if (!formData.dnis) {
      setError('DNIS (To Number) is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload audio to S3/Cloudinary
      const filename = generateAudioFilename(formData.recordingid || 'recording');
      const uploadResult = await uploadAudioToS3(audioBlob, filename);

      // Step 2: Prepare data for database
      const recordingData: NewRecordingData = {
        ...formData,
        filepath: uploadResult.url,
        recordingdate: formData.recordingdate ? new Date(formData.recordingdate).toISOString() : new Date().toISOString(),
        duration: formData.duration || 0,
        filesize: audioBlob.size,
      };

      // Step 3: Insert into database
      await addRecording(recordingData);

      // Success!
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error submitting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to save recording');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Add New Recording</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="text-green-600" size={24} />
              <span className="text-green-800 font-medium">Recording saved successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Audio Recording Section */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
              Audio Recording *
            </label>
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="recordingid" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                Recording ID
              </label>
              <input
                type="text"
                id="recordingid"
                name="recordingid"
                value={formData.recordingid}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                placeholder="Auto-generated if empty"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="recordingdate" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                Recording Date
              </label>
              <input
                type="date"
                id="recordingdate"
                name="recordingdate"
                value={formData.recordingdate}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="direction" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                Direction
              </label>
              <select
                id="direction"
                name="direction"
                value={formData.direction}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border bg-white"
              >
                <option value="">Select Direction</option>
                <option value="Inbound">Inbound</option>
                <option value="Outbound">Outbound</option>
                <option value="Intercom">Intercom</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="workgroup" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                Workgroup
              </label>
              <select
                id="workgroup"
                name="workgroup"
                value={formData.workgroup}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border bg-white"
              >
                <option value="">Select Workgroup</option>
                {MOCK_WORKGROUPS.map(wg => (
                  <option key={wg} value={wg}>{wg}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="duration" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                Duration (seconds)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                placeholder="Duration in seconds"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="mediatype" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                Media Type
              </label>
              <input
                type="text"
                id="mediatype"
                name="mediatype"
                value={formData.mediatype}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                placeholder="e.g., audio, video"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="dnis" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  DNIS (To Number) *
                </label>
                <input
                  type="text"
                  id="dnis"
                  name="dnis"
                  value={formData.dnis}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="Dialed number"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="ani" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  ANI (From Number)
                </label>
                <input
                  type="text"
                  id="ani"
                  name="ani"
                  value={formData.ani}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="Caller number"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="firstparticipant" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  First Participant
                </label>
                <input
                  type="text"
                  id="firstparticipant"
                  name="firstparticipant"
                  value={formData.firstparticipant}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="Primary participant name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="otherparticipants" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Other Participants
                </label>
                <input
                  type="text"
                  id="otherparticipants"
                  name="otherparticipants"
                  value={formData.otherparticipants}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="Comma-separated names"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="toconnection" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  To Connection
                </label>
                <input
                  type="text"
                  id="toconnection"
                  name="toconnection"
                  value={formData.toconnection}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="Connection ID"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="fromconnection" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  From Connection
                </label>
                <input
                  type="text"
                  id="fromconnection"
                  name="fromconnection"
                  value={formData.fromconnection}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="Connection ID"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="attributes" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Attributes
                </label>
                <textarea
                  id="attributes"
                  name="attributes"
                  value={formData.attributes}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="JSON or text attributes"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tags" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                  placeholder="Comma-separated tags"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-gray-200 pt-6 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || success}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Recording
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordingForm;

