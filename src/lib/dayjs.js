import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

// 기본 타임존을 서울로 설정
dayjs.tz.setDefault("Asia/Seoul");

export default dayjs;