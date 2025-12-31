import React from 'react';

function EmailRefusalPage() {
  const styles = {
    header: {
        borderBottom: '2px solid var(--main-navy)',
        paddingBottom: '1rem',
        marginBottom: '2rem',
        textAlign: 'center'
    },
    title: {
        fontSize: '1.8rem',
        fontWeight: '800',
        color: 'var(--main-navy)',
    },
    contentBox: {
        padding: '2rem 1rem',
        textAlign: 'center',
    },
    icon: {
        fontSize: '4rem',
        marginBottom: '1rem',
        display: 'block'
    },
    mainText: {
        fontSize: '1.1rem',
        lineHeight: '1.6',
        color: '#333',
        marginBottom: '2rem',
        fontWeight: '600'
    },
    lawBox: {
        backgroundColor: '#eaf5fc', /* SuccessPage의 info-box와 유사한 톤 */
        border: '1px solid #d0e4f5',
        borderRadius: '12px',
        padding: '1.5rem',
        textAlign: 'left',
        margin: '0 auto',
        maxWidth: '800px'
    },
    lawTitle: {
        color: 'var(--main-navy)',
        fontWeight: '700',
        marginBottom: '1rem',
        borderBottom: '1px dashed #aad0e9',
        paddingBottom: '0.5rem'
    },
    lawText: {
        fontSize: '0.9rem',
        lineHeight: '1.7',
        color: '#555',
        marginBottom: '0.5rem'
    },
    footerText: {
        marginTop: '2rem',
        color: '#888',
        fontSize: '0.9rem'
    }
  };

  return (
    <div className="wrapper">
      <div className="content">
        <div className="container" style={{maxWidth: '800px', margin: '3rem auto'}}>
            
            <div style={styles.header}>
                <h2 style={styles.title}>이메일 무단수집 거부</h2>
            </div>

            <div style={styles.contentBox}>
                <span style={styles.icon}>🚫</span>
                <p style={styles.mainText}>
                    본 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나<br />
                    그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부하며,<br />
                    이를 위반 시 <strong>「정보통신망 이용촉진 및 정보보호 등에 관한 법률」</strong>에 의해<br />
                    형사 처벌됨을 유념하시기 바랍니다.
                </p>

                <div style={styles.lawBox}>
                    <div style={styles.lawTitle}>
                        [관련 법령] 정보통신망 이용촉진 및 정보보호 등에 관한 법률 제50조의 2
                    </div>
                    <ol style={{paddingLeft: '1.2rem', margin: 0}}>
                        <li style={styles.lawText}>누구든지 전자우편주소의 수집을 거부하는 의사가 명시된 인터넷 홈페이지에서 자동으로 전자우편주소를 수집하는 프로그램 그 밖의 기술적 장치를 이용하여 전자우편주소를 수집하여서는 아니 된다.</li>
                        <li style={styles.lawText}>누구든지 제1항의 규정을 위반하여 수집된 전자우편주소를 판매·유통하여서는 아니 된다.</li>
                        <li style={styles.lawText}>누구든지 제1항 및 제2항의 규정에 의하여 수집·판매 및 유통이 금지된 전자우편주소임을 알고 이를 정보전송에 이용하여서는 아니 된다.</li>
                    </ol>
                </div>

                <p style={styles.footerText}>
                    게시일: 2026년 1월 1일
                </p>
            </div>

        </div>
      </div>
    </div>
  );
}

export default EmailRefusalPage;