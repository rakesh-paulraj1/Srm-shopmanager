import React from 'react'

const layout = ({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) => {
  return (
    <div className="min-h-screen bg-white">
    {children}
  </div>
  )
}

export default layout