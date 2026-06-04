
export const OrbitButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <div className="orbit-button">
      <div className="orbit">
        <div className="satellite"></div>
      </div>
      <button {...props}>{ children }</button>
    </div>
  )
}

export const NormalButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button className="normal-button" {...props}>{ children }</button>
  )
}
