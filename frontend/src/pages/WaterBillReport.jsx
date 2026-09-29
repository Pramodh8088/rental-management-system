import React, { useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const WaterBillReport = () => {
  const [bills, setBills] = useState([])
  const [tenants, setTenants] = useState([])
  const [rooms, setRooms] = useState([])
  const [properties, setProperties] = useState([])

  const [selectedProperty, setSelectedProperty] = useState('ALL')
  const [selectedRoom, setSelectedRoom] = useState('ALL')
  const [selectedTenant, setSelectedTenant] = useState('ALL')
  const [selectedMonth, setSelectedMonth] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [
        billsResponse,
        tenantsResponse,
        roomsResponse,
        propertiesResponse
      ] = await Promise.all([
        api.get('/rentals/bills/'),
        api.get('/tenants/'),
        api.get('/rentals/rooms/'),
        api.get('/rentals/properties/')
      ])

      setBills(
        billsResponse.data.filter(
          (bill) => bill.bill_type === 'WATER'
        )
      )

      setTenants(tenantsResponse.data)
      setRooms(roomsResponse.data)
      setProperties(propertiesResponse.data)
    } catch (error) {
      console.error(error)

      if (error.response?.data) {
        setError(JSON.stringify(error.response.data))
      } else {
        setError('Failed to load water bill report.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getTenantRoom = (tenant) => {
    if (!tenant.room) {
      return null
    }

    return (
      rooms.find(
        (room) => Number(room.id) === Number(tenant.room)
      ) || null
    )
  }

  const getProperty = (room) => {
    if (!room?.property) {
      return null
    }

    return (
      properties.find(
        (property) =>
          Number(property.id) === Number(room.property)
      ) || null
    )
  }

  const getWaterBill = (tenantId, month) => {
    return (
      bills.find(
        (bill) =>
          Number(bill.tenant) === Number(tenantId) &&
          bill.billing_month &&
          bill.billing_month.substring(0, 7) === month
      ) || null
    )
  }

  const getMonthName = (month) => {
    const [year, monthNumber] = month.split('-')

    const date = new Date(
      Number(year),
      Number(monthNumber) - 1,
      1
    )

    return date.toLocaleString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  const getRequiredAmount = (bill) => {
    return Number(bill?.amount || 0)
  }

  const getPaidAmount = (bill) => {
    return Number(bill?.paid_amount || 0)
  }

  const getRemainingAmount = (bill) => {
    if (
      bill?.remaining_amount !== undefined &&
      bill?.remaining_amount !== null
    ) {
      return Number(bill.remaining_amount)
    }

    const required = getRequiredAmount(bill)
    const paid = getPaidAmount(bill)

    return Math.max(required - paid, 0)
  }

  const getStatus = (bill, required, paid) => {
    if (!bill) {
      return required === 0
        ? 'Not Required'
        : 'Pending'
    }

    if (bill.status === 'PAID') {
      return 'Paid'
    }

    if (bill.status === 'PARTIALLY_PAID') {
      return 'Partially Paid'
    }

    if (paid === 0) {
      return 'Pending'
    }

    if (paid < required) {
      return 'Partially Paid'
    }

    return 'Paid'
  }

  const getStatusClass = (status) => {
    if (status === 'Paid') {
      return 'status-paid'
    }

    if (
      status === 'Pending' ||
      status === 'Partially Paid'
    ) {
      return 'status-pending'
    }

    return ''
  }

  const months = useMemo(() => {
    const billingMonths = bills
      .filter(
        (bill) =>
          bill.billing_month
      )
      .map(
        (bill) =>
          bill.billing_month.substring(0, 7)
      )

    return [...new Set(billingMonths)].sort().reverse()
  }, [bills])

  const filteredRooms = useMemo(() => {
    if (selectedProperty === 'ALL') {
      return rooms
    }

    return rooms.filter(
      (room) =>
        Number(room.property) ===
        Number(selectedProperty)
    )
  }, [rooms, selectedProperty])

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      if (!tenant.is_active || !tenant.room) {
        return false
      }

      const room = getTenantRoom(tenant)

      if (!room) {
        return false
      }

      if (
        selectedProperty !== 'ALL' &&
        Number(room.property) !==
          Number(selectedProperty)
      ) {
        return false
      }

      if (
        selectedRoom !== 'ALL' &&
        Number(room.id) !==
          Number(selectedRoom)
      ) {
        return false
      }

      if (
        selectedTenant !== 'ALL' &&
        Number(tenant.id) !==
          Number(selectedTenant)
      ) {
        return false
      }

      return true
    })
  }, [
    tenants,
    rooms,
    selectedProperty,
    selectedRoom,
    selectedTenant
  ])

  const filteredMonths = useMemo(() => {
    if (selectedMonth === 'ALL') {
      return months
    }

    return months.filter(
      (month) => month === selectedMonth
    )
  }, [months, selectedMonth])

  const clearFilters = () => {
    setSelectedProperty('ALL')
    setSelectedRoom('ALL')
    setSelectedTenant('ALL')
    setSelectedMonth('ALL')
    setSelectedStatus('ALL')
  }

  if (loading) {
    return (
      <div>
        <h2>Water Bill Report</h2>
        <p>Loading water bill report...</p>
      </div>
    )
  }

  return (
    <div>
      <h2>Water Bill Report</h2>

      <p>
        Water bill collection report for all active tenants.
      </p>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      <div
        className="data-card"
        style={{
          marginBottom: '25px'
        }}
      >
        <h3>Report Filters</h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px',
            marginTop: '15px'
          }}
        >
          <div>
            <label>
              <strong>Property</strong>
            </label>

            <select
              value={selectedProperty}
              onChange={(event) => {
                setSelectedProperty(event.target.value)
                setSelectedRoom('ALL')
              }}
              style={selectStyle}
            >
              <option value="ALL">
                All Properties
              </option>

              {properties.map((property) => (
                <option
                  key={property.id}
                  value={property.id}
                >
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>
              <strong>Room</strong>
            </label>

            <select
              value={selectedRoom}
              onChange={(event) =>
                setSelectedRoom(event.target.value)
              }
              style={selectStyle}
            >
              <option value="ALL">
                All Rooms
              </option>

              {filteredRooms.map((room) => (
                <option
                  key={room.id}
                  value={room.id}
                >
                  {room.room_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>
              <strong>Tenant</strong>
            </label>

            <select
              value={selectedTenant}
              onChange={(event) =>
                setSelectedTenant(event.target.value)
              }
              style={selectStyle}
            >
              <option value="ALL">
                All Tenants
              </option>

              {filteredTenants.map((tenant) => (
                <option
                  key={tenant.id}
                  value={tenant.id}
                >
                  {tenant.tenant_id ||
                    tenant.username ||
                    tenant.user?.username ||
                    `Tenant ${tenant.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>
              <strong>Month</strong>
            </label>

            <select
              value={selectedMonth}
              onChange={(event) =>
                setSelectedMonth(event.target.value)
              }
              style={selectStyle}
            >
              <option value="ALL">
                All Months
              </option>

              {months.map((month) => (
                <option
                  key={month}
                  value={month}
                >
                  {getMonthName(month)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>
              <strong>Status</strong>
            </label>

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value)
              }
              style={selectStyle}
            >
              <option value="ALL">
                All Status
              </option>

              <option value="PAID">
                Paid
              </option>

              <option value="PARTIALLY_PAID">
                Partially Paid
              </option>

              <option value="PENDING">
                Pending
              </option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          style={clearButtonStyle}
        >
          Clear Filters
        </button>
      </div>

      {filteredMonths.length === 0 ? (
        <div className="data-card">
          <p>
            No water bill records found for the selected filters.
          </p>
        </div>
      ) : (
        filteredMonths.map((month) => {
          const monthTenants = filteredTenants.filter(
            (tenant) => {
              const room = getTenantRoom(tenant)

              if (!room) {
                return false
              }

              const bill =
                getWaterBill(
                  tenant.id,
                  month
                )

              const required =
                getRequiredAmount(bill)

              const paid =
                getPaidAmount(bill)

              const status =
                getStatus(
                  bill,
                  required,
                  paid
                )

              if (
                selectedStatus !== 'ALL'
              ) {
                if (
                  selectedStatus === 'PAID' &&
                  status !== 'Paid'
                ) {
                  return false
                }

                if (
                  selectedStatus ===
                    'PARTIALLY_PAID' &&
                  status !== 'Partially Paid'
                ) {
                  return false
                }

                if (
                  selectedStatus === 'PENDING' &&
                  status !== 'Pending'
                ) {
                  return false
                }
              }

              return true
            }
          )

          return (
            <div
              key={month}
              className="data-card"
              style={{
                marginBottom: '30px',
                overflowX: 'auto'
              }}
            >
              <h3>
                {getMonthName(month)}
              </h3>

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: '1150px'
                }}
              >
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>
                      Property
                    </th>

                    <th style={tableHeaderStyle}>
                      Room No.
                    </th>

                    <th style={tableHeaderStyle}>
                      Tenant
                    </th>

                    <th style={tableHeaderStyle}>
                      Bill Amount
                    </th>

                    <th style={tableHeaderStyle}>
                      Paid
                    </th>

                    <th style={tableHeaderStyle}>
                      Balance
                    </th>

                    <th style={tableHeaderStyle}>
                      Status
                    </th>

                    <th style={tableHeaderStyle}>
                      Billing Date
                    </th>

                    <th style={tableHeaderStyle}>
                      Paid Date
                    </th>

                    <th style={tableHeaderStyle}>
                      Units
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {monthTenants.length === 0 ? (
                    <tr>
                      <td
                        colSpan="10"
                        style={tableCellStyle}
                      >
                        No records found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    monthTenants.map((tenant) => {
                      const room =
                        getTenantRoom(tenant)

                      if (!room) {
                        return null
                      }

                      const property =
                        getProperty(room)

                      const bill =
                        getWaterBill(
                          tenant.id,
                          month
                        )

                      const required =
                        getRequiredAmount(bill)

                      const paid =
                        getPaidAmount(bill)

                      const balance =
                        getRemainingAmount(bill)

                      const status =
                        getStatus(
                          bill,
                          required,
                          paid
                        )

                      return (
                        <tr key={tenant.id}>
                          <td style={tableCellStyle}>
                            {property?.name ||
                              'N/A'}
                          </td>

                          <td style={tableCellStyle}>
                            {room.room_number}
                          </td>

                          <td style={tableCellStyle}>
                            {tenant.tenant_id}
                            <br />
                            {tenant.first_name}{' '}
                            {tenant.last_name || ''}
                          </td>

                          <td style={tableCellStyle}>
                            ₹{required.toFixed(2)}
                          </td>

                          <td style={tableCellStyle}>
                            ₹{paid.toFixed(2)}
                          </td>

                          <td style={tableCellStyle}>
                            ₹{balance.toFixed(2)}
                          </td>

                          <td style={tableCellStyle}>
                            <span
                              className={
                                getStatusClass(status)
                              }
                            >
                              {status}
                            </span>
                          </td>

                          <td style={tableCellStyle}>
                            {bill?.billing_month ||
                              '—'}
                          </td>

                          <td style={tableCellStyle}>
                            {bill?.paid_date ||
                              '—'}
                          </td>

                          <td style={tableCellStyle}>
                            {bill?.units !== null &&
                            bill?.units !== undefined &&
                            bill?.units !== ''
                              ? bill.units
                              : '—'}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )
        })
      )}
    </div>
  )
}

const tableHeaderStyle = {
  border: '1px solid #ddd',
  padding: '12px',
  textAlign: 'left',
  background: '#f8fafc'
}

const tableCellStyle = {
  border: '1px solid #ddd',
  padding: '12px',
  textAlign: 'left'
}

const selectStyle = {
  width: '100%',
  padding: '10px',
  marginTop: '6px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  background: '#fff'
}

const clearButtonStyle = {
  marginTop: '20px',
  padding: '10px 18px',
  border: 'none',
  borderRadius: '5px',
  background: '#2563eb',
  color: '#fff',
  cursor: 'pointer'
}

export default WaterBillReport