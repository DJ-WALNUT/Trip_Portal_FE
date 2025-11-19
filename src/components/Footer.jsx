import React from 'react';

function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={contentStyle}>
        <p>
          &copy; 2025 Catholic University of Korea<br/>
          CUK Engineering Student Council <strong>Trip</strong>. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

// 간단한 스타일은 파일 안에 변수로 넣었습니다 (CSS 파일 따로 만들기 귀찮을 때 유용)
const footerStyle = {
    backgroundColor: '#f1f3f5',
    padding: '2rem 0',
    marginTop: 'auto', // 화면 내용이 적어도 푸터는 바닥에 붙게 함
    borderTop: '1px solid #e9ecef',
    color: '#868e96',
    fontSize: '0.9rem',
    textAlign: 'center',
    lineHeight: '1.6'
};

const contentStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 1rem'
};

export default Footer;