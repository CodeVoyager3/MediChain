import React from 'react'
import { useActiveAccount } from "thirdweb/react";

function PatientDashboard() {
  const account = useActiveAccount(); 

  return (
    <div>
      {account ? (
        <p>Welcome! Your wallet address is: {account.address}</p>
      ) : (
        <p>Please connect your wallet to view records.</p>
      )}
    </div>
  )
}

export default PatientDashboard
