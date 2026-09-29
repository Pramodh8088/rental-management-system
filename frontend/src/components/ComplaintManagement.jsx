import React, { useEffect, useState } from 'react'
import api from '../services/api'

const ComplaintManagement = () => {

  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadComplaints = async () => {

    try {

      const response = await api.get('/complaints/')

      setComplaints(response.data)

    } catch (error) {

      console.error(error)
      setError('Failed to load complaints.')

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  const updateComplaint = async (
    complaint,
    status,
    landlordResponse
  ) => {

    try {

      await api.patch(
        `/complaints/${complaint.id}/`,
        {
          status: status,
          landlord_response: landlordResponse
        }
      )

      await loadComplaints()

    } catch (error) {

      console.error(error)

      if (error.response?.data) {
        setError(
          JSON.stringify(error.response.data)
        )
      } else {
        setError('Failed to update complaint.')
      }

    }
  }

  const getStatusText = (status) => {

    if (status === 'OPEN') {
      return 'Open'
    }

    if (status === 'IN_PROGRESS') {
      return 'In Progress'
    }

    if (status === 'RESOLVED') {
      return 'Resolved'
    }

    return status
  }

  if (loading) {

    return (
      <div>
        <h2>Complaint Management</h2>
        <p>Loading...</p>
      </div>
    )

  }

  return (
    <div>

      <h2>Complaint Management</h2>

      {error && (
        <p>
          {error}
        </p>
      )}

      {complaints.length === 0 ? (

        <p>
          No complaints found.
        </p>

      ) : (

        complaints.map((complaint) => (

          <ComplaintItem
            key={complaint.id}
            complaint={complaint}
            getStatusText={getStatusText}
            updateComplaint={updateComplaint}
          />

        ))

      )}

    </div>
  )
}

const ComplaintItem = ({
  complaint,
  getStatusText,
  updateComplaint
}) => {

  const [status, setStatus] = useState(
    complaint.status
  )

  const [response, setResponse] = useState(
    complaint.landlord_response || ''
  )

  const [saving, setSaving] = useState(false)

  const handleUpdate = async () => {

    setSaving(true)

    await updateComplaint(
      complaint,
      status,
      response
    )

    setSaving(false)
  }

  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '8px'
      }}
    >

      <h3>
        {complaint.subject}
      </h3>

      <p>
        <strong>Tenant:</strong>{' '}
        {complaint.tenant_name || complaint.tenant_id}
      </p>

      <p>
        <strong>Description:</strong>{' '}
        {complaint.description}
      </p>

      <p>
        <strong>Current Status:</strong>{' '}
        {getStatusText(complaint.status)}
      </p>

      <div>

        <label>
          Update Status
        </label>

        <br />

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
        >

          <option value="OPEN">
            Open
          </option>

          <option value="IN_PROGRESS">
            In Progress
          </option>

          <option value="RESOLVED">
            Resolved
          </option>

        </select>

      </div>

      <br />

      <div>

        <label>
          Landlord Response
        </label>

        <br />

        <textarea
          value={response}
          onChange={(event) =>
            setResponse(event.target.value)
          }
          rows="4"
          placeholder="Enter response to tenant"
        />

      </div>

      <br />

      <button
        onClick={handleUpdate}
        disabled={saving}
      >
        {saving
          ? 'Saving...'
          : 'Update Complaint'}
      </button>

      {complaint.resolved_at && (

        <p>
          <strong>Resolved At:</strong>{' '}
          {new Date(
            complaint.resolved_at
          ).toLocaleString()}
        </p>

      )}

    </div>
  )
}

export default ComplaintManagement
