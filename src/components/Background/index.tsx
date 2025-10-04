import './style.css';


const Background = () => {
  return (
    <div className="background"
      style={{
        position: 'fixed',
        height: 'calc(var(--vh, 1vh) * 100)',
        width: '100vw',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <img className="main" src="./images/galaxy.png" alt="" />
    </div>
  );
}

export default Background;