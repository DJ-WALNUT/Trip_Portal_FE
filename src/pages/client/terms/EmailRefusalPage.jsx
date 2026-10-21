import React from 'react';
import { Ban } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import './Terms.css';

function EmailRefusalPage() {
  return (
    <div className="refusal-page">
      <PageHeader title="이메일 무단수집 거부" />
      <div className="refusal-page__main">
        <span className="refusal-page__icon" aria-hidden="true"><Ban size={56} /></span>
        <p className="refusal-page__lead">
          본 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나<br />
          그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부하며,<br />
          이를 위반 시 <strong>「정보통신망 이용촉진 및 정보보호 등에 관한 법률」</strong>에 의해<br />
          형사 처벌됨을 유념하시기 바랍니다.
        </p>

        <div className="refusal-page__law">
          <div className="refusal-page__law-title">
            [관련 법령] 정보통신망 이용촉진 및 정보보호 등에 관한 법률 제50조의 2
          </div>
          <ol>
            <li>누구든지 전자우편주소의 수집을 거부하는 의사가 명시된 인터넷 홈페이지에서 자동으로 전자우편주소를 수집하는 프로그램 그 밖의 기술적 장치를 이용하여 전자우편주소를 수집하여서는 아니 된다.</li>
            <li>누구든지 제1항의 규정을 위반하여 수집된 전자우편주소를 판매·유통하여서는 아니 된다.</li>
            <li>누구든지 제1항 및 제2항의 규정에 의하여 수집·판매 및 유통이 금지된 전자우편주소임을 알고 이를 정보전송에 이용하여서는 아니 된다.</li>
          </ol>
        </div>

        <p className="refusal-page__date">게시일: 2026년 1월 1일</p>
      </div>
    </div>
  );
}

export default EmailRefusalPage;
