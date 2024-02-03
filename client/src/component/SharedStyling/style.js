
export const gridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gridTemplateRows: 'repeat(2, 1fr)',
  height: '100vh',
  padding: '0 1rem 1rem',
  boxSizing: 'border-box',
  gridGap: 10,
  marginTop: '1rem'
};

export const gridItemStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #ccc',
  borderRadius: 3,
  boxSizing: 'border-box',
  flexDirection: 'column',
};

export const winnerImageBg = {
  width: '100%',
  height: '100%',
  maxWidth: '100%'
}

export const heroRegistration = {
  backgroundColor: '#fff',
  display: 'flex',
  minHeight: 350,
  backgroundImage: 'repeating-linear-gradient( 45deg, #ff6347, #ff6347 5px, #fff 5px, #fff 25px )',
  opacity: 0.8,
}

export const formRegistration = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  paddingBottom: '5rem',
  backgroundColor: 'tomato'
}

export const formInnerContainer = {
  backgroundColor: '#ffffff',
  borderRadius: 5,
  boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px',
  margin: 'auto',
  boxSizing: 'border-box',
  marginTop: '-8rem',
  padding: '2rem 3rem',
  width: 'calc(100%/3)',
}

export const formHeader = {
  textAlign: 'center',
  marginBottom: '1rem'
}

export const formInputWrapper = {
  display: 'flex',
  flexDirection: 'column',
}

export const formInput = {
  lineHeight: '25px',
  margin: '12px 0',
  padding: '0.5rem'
}

export const formButton = {
  display: 'block',
  margin: '1rem 0',
  padding: '1rem',
  width: '100%'
}
