import { useEffect, useState } from 'react'
import { Customer } from '@prisma/client'

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  return (
    <div>
      {customers.map((customer) => (
        <div key={customer.id}>
          <h3>{customer.name}</h3>
          <p>{customer.email}</p>
        </div>
      ))}
    </div>
  )
}