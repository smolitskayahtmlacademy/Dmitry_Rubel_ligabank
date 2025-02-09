import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getLoadHistory } from "../../store/api-actions";
import { getConverter, getConverterHistory } from "../../store/selector";
import CurrencyOptions from "../currencyOptions/currencyOptions.jsx";

function MainComponent() {
  const history = useSelector(getConverterHistory);
  const converterList = useSelector(getConverter);

  let {base, date, rates} = converterList;

  const [leftValute, setLeftValute] = useState();
  const [rightValute, setRightValute] = useState();
  const [leftValue, setLeftValue] = useState(1000.00);
  const [rightValue, setRightValue] = useState(1000.00);
  const [localHisory, setLocalHistory] = useState(JSON.parse(localStorage.getItem('history')));
  
  const day = dayjs(date).subtract(7, 'day').format('YYYY-MM-DD');

  const dispatch = useDispatch();

  useEffect(() => {
    if(!leftValute || !rightValute) {
      setRightValute(base);
      setLeftValute(base);
    }
    if(history.rates) {
      rates = history.rates;
      date = history.date;
      leftChange(leftValue,null);
    }
  });

  function leftChange(value, valute) {
    let result;
    if(value !== null) {
      result = value/rates[leftValute]*rates[rightValute];
      setLeftValue(value);
    } else {
      result = leftValue/rates[valute]*rates[rightValute];
      setLeftValute(valute);
    }
    setRightValue(Math.floor(result*10000)/10000);
  }

  function rightChange(value, valute) {
    let result;
    if(value !== null) {
      result = value/rates[rightValute]*rates[leftValute];
      setRightValue(value);
    } else {
      result = rightValue/rates[valute]*rates[leftValute];
      setRightValute(valute);
    }
    setLeftValue(Math.floor(result*10000)/10000);
  }

  const ratesValue = [];
  for (let rate in rates) {
    if(rates.hasOwnProperty(rate)) {
      ratesValue.push(rate);
    }
  }

  function addToHistory(evt) {
    evt.preventDefault();
    const result = [...JSON.parse(localStorage.getItem('history'))];
    if(result.length === 10) {
      result.splice(0,1);
    }
    result.push({
      date: date,
      leftValue: leftValue,
      leftValute: leftValute,
      rightValue: rightValue,
      rightValute: rightValute,
    });
    localStorage.setItem('history', JSON.stringify(result));
    setLocalHistory(JSON.parse(localStorage.getItem('history')));
  }

  return (
    <>
      <header className="header">
        <div className="header-case">
          <div className="header-wrapper">
              <Link className="header-logo" to={"/"}>
                <picture>
                  <img className="header-logo__tagline" src="./image/logo-liga.svg" alt="Логотип ЛигаБанк"/>
                </picture>
              </Link>
          </div>
          <nav className="header-nav">
            <ul className="header__nav-list">
              <li className="header__nav-item"><Link to={"/"}>Услуги</Link></li>
              <li className="header__nav-item"><Link to={"/"}>Рассчитать кредит</Link></li>
              <li className="header__nav-item"><Link to={"/"}>Конвертер валют</Link></li>
              <li className="header__nav-item"><Link to={"/"}>Контакты</Link></li>
              <li className="header__nav-item"><Link to={"/"}>Задать вопрос</Link></li>
            </ul>
          </nav>
          <Link to={"/"} className="header__login-link">Войти в Интернет-банк</Link>
        </div>
      </header>
      <main className="page__main">
        <h1 className="visually-hidden">Лига Банк</h1>
          <section className="banner">
            <div className="banner__gradient">
              <h2 className="visually-hidden">Баннер Лига Банк</h2>
                <div className="banner__wrapper">
                  <div className="banner__description">
                    <h2 className="banner__header">Лига Банк</h2>
                    <p className="banner__text">Кредиты на любой случай</p>
                    <Link to={"/"} className="banner__button">
                      <span className="banner__button-text">Рассчитать кредит</span>
                    </Link>
                  </div>
                </div>
            </div>
          </section>
              <section className="converter">
                <h2 className="visually-hidden">Конвертер валют</h2>
                <form className="converter__form">
                  <h2 className="converter__header">Конвертер валют</h2>
                    <div className="converter__case">
                      <div className="converter__position">
                        <span className="converter__name-input">У меня есть</span>
                        <div className="converter__wrapper">
                          <CurrencyOptions 
                            onChange={leftChange}
                            value={leftValue}
                            valute={leftValute}
                            currencyRates={ratesValue} 
                          />
                        </div>
                      </div>
                      <div className="converter__position">
                        <span className="converter__name-input">Хочу приобрести</span>
                        <div className="converter__wrapper">
                          <CurrencyOptions
                            onChange={rightChange}
                            value={rightValue}
                            valute={rightValute}
                            currencyRates={ratesValue} 
                          />
                        </div>
                      </div>
                    </div>
                  <div className="converter__submit-wrapper">
                    <input className="converter__value converter__date"
                      type="date"
                      onChange={(evt)=>{
                        dispatch(getLoadHistory(evt.target.value))
                      }}
                      defaultValue={date}
                      min={day} max={date}
                    />
                    <button className="converter__button" onClick={addToHistory}>Сохранить результат</button>
                  </div>
                </form>
              </section>
              <section className="history">
                <h2 className="visually-hidden">История</h2>
                <div className="history__wrapper">
                  <h2 className="history__header">История конвертация</h2>
                  <div className="history__converter">
                    <ul className="history__list">
                    {localHisory.map((item, index) => {return (
                      <li key={index} className="history__item">
                        <span className="history__text">{item.date}</span>
                        <span className="history__text history__text-arrow">{item.leftValue} {item.leftValute}</span>
                        <span className="history__text">{item.rightValue} {item.rightValute}</span>
                      </li> )})}
                    </ul>
                  </div>
                  <button className="history__button-delete" onClick={(evt) => {
                      evt.preventDefault();
                      localStorage.setItem('history', JSON.stringify([]));
                      setLocalHistory(JSON.parse(localStorage.getItem('history')));
                    }}
                  >Очистить историю</button>
                </div>
              </section>
        </main>
        <footer className="page-footer">
          <section className="footer-description">
            <h2 className="visually-hidden">Контакты Банка</h2>
            <div className="footer-description__wrapper">
              <div className="adress">
                <a href="/" className="adress__logo">
                  <svg width="150" height="27" viewBox="0 0 150 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M51.1 26H48.08V14.24H44.58C44.5 14.8533 44.4133 15.52 44.32 16.24C44.24 16.96 44.1467 17.6933 44.04 18.44C43.9467 19.1733 43.8467 19.8733 43.74 20.54C43.6333 21.1933 43.5267 21.7733 43.42 22.28C43.2467 23.1067 43.0133 23.8133 42.72 24.4C42.44 24.9867 42.0467 25.4333 41.54 25.74C41.0467 26.0467 40.4 26.2 39.6 26.2C39.08 26.2 38.6 26.1267 38.16 25.98V23.5C38.3333 23.5533 38.5 23.6 38.66 23.64C38.8333 23.68 39.02 23.7 39.22 23.7C39.6067 23.7 39.9 23.5 40.1 23.1C40.3133 22.6867 40.5267 21.92 40.74 20.8C40.82 20.3733 40.9333 19.7067 41.08 18.8C41.2267 17.8933 41.3867 16.8333 41.56 15.62C41.7467 14.3933 41.92 13.0933 42.08 11.72H51.1V26ZM54.7023 11.72H57.4223V18.62C57.4223 18.9533 57.4157 19.3267 57.4023 19.74C57.389 20.1533 57.3757 20.56 57.3623 20.96C57.349 21.3467 57.3357 21.6867 57.3223 21.98C57.309 22.26 57.2957 22.4533 57.2823 22.56H57.3423L63.9423 11.72H67.5623V26H64.8623V19.14C64.8623 18.78 64.869 18.3867 64.8823 17.96C64.8957 17.52 64.909 17.1 64.9223 16.7C64.949 16.3 64.969 15.9533 64.9823 15.66C65.009 15.3533 65.029 15.1533 65.0423 15.06H64.9623L58.3423 26H54.7023V11.72ZM80.1872 11.72V14.22H74.1872V26H71.1672V11.72H80.1872ZM89.7119 26L88.6719 22.6H83.4719L82.4319 26H79.1719L84.2119 11.66H87.9119L92.9719 26H89.7119ZM87.9519 20.06L86.9119 16.74C86.8452 16.5133 86.7585 16.2267 86.6519 15.88C86.5452 15.5333 86.4385 15.18 86.3319 14.82C86.2252 14.46 86.1385 14.1467 86.0719 13.88C86.0052 14.1467 85.9119 14.48 85.7919 14.88C85.6852 15.2667 85.5785 15.64 85.4719 16C85.3785 16.3467 85.3052 16.5933 85.2519 16.74L84.2319 20.06H87.9519ZM100.503 26V11.72H109.523V14.22H103.523V17.2H104.723C106.07 17.2 107.17 17.3867 108.023 17.76C108.89 18.1333 109.53 18.6467 109.943 19.3C110.356 19.9533 110.563 20.7 110.563 21.54C110.563 22.9533 110.09 24.0533 109.143 24.84C108.21 25.6133 106.716 26 104.663 26H100.503ZM103.523 23.52H104.543C105.463 23.52 106.183 23.3733 106.703 23.08C107.236 22.7867 107.503 22.2733 107.503 21.54C107.503 20.78 107.216 20.28 106.643 20.04C106.07 19.8 105.29 19.68 104.303 19.68H103.523V23.52ZM117.497 14.86C118.964 14.86 120.084 15.18 120.857 15.82C121.644 16.4467 122.037 17.4133 122.037 18.72V26H119.957L119.377 24.52H119.297C118.83 25.1067 118.337 25.5333 117.817 25.8C117.297 26.0667 116.584 26.2 115.677 26.2C114.704 26.2 113.897 25.92 113.257 25.36C112.617 24.7867 112.297 23.9133 112.297 22.74C112.297 21.58 112.704 20.7267 113.517 20.18C114.33 19.62 115.55 19.3133 117.177 19.26L119.077 19.2V18.72C119.077 18.1467 118.924 17.7267 118.617 17.46C118.324 17.1933 117.91 17.06 117.377 17.06C116.844 17.06 116.324 17.14 115.817 17.3C115.31 17.4467 114.804 17.6333 114.297 17.86L113.317 15.84C113.904 15.5333 114.55 15.2933 115.257 15.12C115.977 14.9467 116.724 14.86 117.497 14.86ZM119.077 20.94L117.917 20.98C116.957 21.0067 116.29 21.18 115.917 21.5C115.544 21.82 115.357 22.24 115.357 22.76C115.357 23.2133 115.49 23.54 115.757 23.74C116.024 23.9267 116.37 24.02 116.797 24.02C117.437 24.02 117.977 23.8333 118.417 23.46C118.857 23.0733 119.077 22.5333 119.077 21.84V20.94ZM128.067 15.08V19.28H132.227V15.08H135.207V26H132.227V21.5H128.067V26H125.087V15.08H128.067ZM145.49 15.08H148.77L144.45 20.32L149.15 26H145.77L141.31 20.46V26H138.33V15.08H141.31V20.38L145.49 15.08Z" fill="#1F1E25"/>
                    <path d="M16.75 1H13.8333L1 22.3415H4.79167L6.54167 19.2927L16.75 1Z" fill="#2C36F2"/>
                    <path d="M2.75 26H27.25L16.75 7.09756L15 10.1463L20.25 19.2927L22 22.3415H4.79167H1L2.75 26Z" fill="#2C36F2"/>
                    <path d="M22 22.3415L20.25 19.2927H9.75H6.54167L4.79167 22.3415H22Z" fill="#2C36F2"/>
                    <path d="M27.25 26L29 22.3415L16.75 1L6.54167 19.2927H9.75L15 10.1463L16.75 7.09756L27.25 26Z" fill="#2C36F2"/>
                    <path d="M15 10.1463L9.75 19.2927H20.25L15 10.1463Z" fill="#2C36F2"/>
                    <path d="M27.25 26H2.75L1 22.3415M27.25 26L29 22.3415L16.75 1M27.25 26L16.75 7.09756L15 10.1463M16.75 1H13.8333L1 22.3415M16.75 1L6.54167 19.2927M1 22.3415H4.79167M15 10.1463L9.75 19.2927M15 10.1463L20.25 19.2927M9.75 19.2927H20.25M9.75 19.2927H6.54167M20.25 19.2927L22 22.3415H4.79167M6.54167 19.2927L4.79167 22.3415" stroke="#F6F7FF"/>
                  </svg>
                </a>
                  <p className="adress__text">150015, г. Москва, ул. Московская, д. 32
                      Генеральная лицензия Банка России №1050
                      Ⓒ Лига Банк, 2019</p>
              </div>
              <div className="services">
                <ul className="services__list">
                  <li className="services__item"><Link to={'/'}>Услуги</Link></li>
                  <li className="services__item"><Link to={'/'}>Рассчитать кредит</Link></li>
                  <li className="services__item"><Link to={'/'}>Контакты</Link></li>
                  <li className="services__item"><Link to={'/'}>Задать вопрос</Link></li>
                </ul>
              </div>
              <div className="mobile">
                <span className="mobile__code">*0904</span>
                <p className="mobile__description">Бесплатно для абонентов МТС, Билайн, Мегафон, Теле2</p>
              </div>
              <div className="contacts">
                <a className="contacts__mobile" href="tel:88001112233">8 800 111 22 33</a>
                <p className="contacts__description">Бесплатный для всех городов России</p>
              </div>
              <div className="social">
                <ul className="social__list">
                  <li className="social__item">
                    <a href="https://www.facebook.com/" className="sociai__icon">
                      <svg width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9.2H8.14286L9 6H6V4.4C6 3.576 6 2.8 7.71429 2.8H9V0.112C8.72057 0.0776001 7.66543 0 6.55114 0C4.224 0 2.57143 1.3256 2.57143 3.76V6H0V9.2H2.57143V16H6V9.2Z" fill="#1F1E25"/>
                      </svg>
                    </a>
                  </li>
                  <li className="social__item">
                    <a href="https://www.instagram.com/" className="sociai__icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 0C10.1736 0 10.4448 0.00799995 11.2976 0.048C12.1496 0.088 12.7296 0.2216 13.24 0.42C13.768 0.6232 14.2128 0.8984 14.6576 1.3424C15.0644 1.74232 15.3792 2.22607 15.58 2.76C15.7776 3.2696 15.912 3.8504 15.952 4.7024C15.9896 5.5552 16 5.8264 16 8C16 10.1736 15.992 10.4448 15.952 11.2976C15.912 12.1496 15.7776 12.7296 15.58 13.24C15.3797 13.7742 15.0649 14.2581 14.6576 14.6576C14.2576 15.0643 13.7738 15.379 13.24 15.58C12.7304 15.7776 12.1496 15.912 11.2976 15.952C10.4448 15.9896 10.1736 16 8 16C5.8264 16 5.5552 15.992 4.7024 15.952C3.8504 15.912 3.2704 15.7776 2.76 15.58C2.22586 15.3796 1.74202 15.0648 1.3424 14.6576C0.935525 14.2577 0.620745 13.774 0.42 13.24C0.2216 12.7304 0.088 12.1496 0.048 11.2976C0.0104 10.4448 0 10.1736 0 8C0 5.8264 0.00799995 5.5552 0.048 4.7024C0.088 3.8496 0.2216 3.2704 0.42 2.76C0.620189 2.22574 0.935043 1.74186 1.3424 1.3424C1.74214 0.935385 2.22594 0.620583 2.76 0.42C3.2704 0.2216 3.8496 0.088 4.7024 0.048C5.5552 0.0104 5.8264 0 8 0ZM8 4C6.93913 4 5.92172 4.42143 5.17157 5.17157C4.42143 5.92172 4 6.93913 4 8C4 9.06087 4.42143 10.0783 5.17157 10.8284C5.92172 11.5786 6.93913 12 8 12C9.06087 12 10.0783 11.5786 10.8284 10.8284C11.5786 10.0783 12 9.06087 12 8C12 6.93913 11.5786 5.92172 10.8284 5.17157C10.0783 4.42143 9.06087 4 8 4ZM13.2 3.8C13.2 3.53478 13.0946 3.28043 12.9071 3.09289C12.7196 2.90536 12.4652 2.8 12.2 2.8C11.9348 2.8 11.6804 2.90536 11.4929 3.09289C11.3054 3.28043 11.2 3.53478 11.2 3.8C11.2 4.06522 11.3054 4.31957 11.4929 4.50711C11.6804 4.69464 11.9348 4.8 12.2 4.8C12.4652 4.8 12.7196 4.69464 12.9071 4.50711C13.0946 4.31957 13.2 4.06522 13.2 3.8ZM8 5.6C8.63652 5.6 9.24697 5.85286 9.69706 6.30294C10.1471 6.75303 10.4 7.36348 10.4 8C10.4 8.63652 10.1471 9.24697 9.69706 9.69706C9.24697 10.1471 8.63652 10.4 8 10.4C7.36348 10.4 6.75303 10.1471 6.30294 9.69706C5.85286 9.24697 5.6 8.63652 5.6 8C5.6 7.36348 5.85286 6.75303 6.30294 6.30294C6.75303 5.85286 7.36348 5.6 8 5.6Z" fill="#1F1E25"/>
                      </svg>
                    </a>
                  </li>
                  <li className="social__item">
                    <a href="https://www.twitter.com" className="sociai__icon">
                      <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.9992 1.54324C15.4 1.80812 14.7645 1.98209 14.1138 2.05937C14.7996 1.64947 15.313 1.00438 15.5581 0.244297C14.9144 0.627078 14.2088 0.895338 13.4733 1.04045C12.9793 0.512227 12.3245 0.161908 11.6106 0.0439529C10.8968 -0.0740019 10.164 0.047017 9.52611 0.388195C8.88822 0.729374 8.38099 1.2716 8.08329 1.93057C7.78559 2.58954 7.71409 3.32833 7.87991 4.0321C6.57465 3.96673 5.29775 3.62777 4.13209 3.03724C2.96644 2.4467 1.93809 1.6178 1.11381 0.604331C0.822049 1.10512 0.668725 1.67441 0.669545 2.2539C0.669545 3.39126 1.24882 4.39606 2.12951 4.98435C1.60833 4.96795 1.09861 4.8273 0.642857 4.57411V4.6149C0.643014 5.37238 0.905313 6.1065 1.38528 6.69279C1.86525 7.27907 2.53335 7.68144 3.27629 7.83167C2.79248 7.96269 2.28517 7.98201 1.79278 7.88815C2.00225 8.54016 2.41052 9.11038 2.96043 9.51897C3.51034 9.92757 4.17436 10.1541 4.8595 10.1668C4.17856 10.7012 3.39888 11.0963 2.56506 11.3294C1.73123 11.5625 0.859598 11.6291 0 11.5253C1.50055 12.4897 3.24733 13.0017 5.0314 13C11.0699 13 14.3721 8.0011 14.3721 3.66579C14.3721 3.5246 14.3681 3.38184 14.3619 3.24222C15.0046 2.778 15.5593 2.20293 16 1.54403L15.9992 1.54324Z" fill="#1F1E25"/>
                      </svg>
                    </a>
                  </li>
                  <li className="social__item">
                    <a href="https://www.youtube.com" className="sociai__icon"> 
                      <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.6344 2.02963C16 3.4775 16 6.5 16 6.5C16 6.5 16 9.5225 15.6344 10.9704C15.4312 11.7707 14.8368 12.4004 14.084 12.6132C12.7168 13 8 13 8 13C8 13 3.2856 13 1.916 12.6132C1.16 12.3971 0.5664 11.7683 0.3656 10.9704C2.38419e-08 9.5225 0 6.5 0 6.5C0 6.5 2.38419e-08 3.4775 0.3656 2.02963C0.5688 1.22931 1.1632 0.599625 1.916 0.38675C3.2856 -1.45286e-07 8 0 8 0C8 0 12.7168 -1.45286e-07 14.084 0.38675C14.84 0.602875 15.4336 1.23175 15.6344 2.02963ZM6.4 9.34375L11.2 6.5L6.4 3.65625V9.34375Z" fill="#1F1E25"/>
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>
      </footer>
    </>
  );
}

  export default MainComponent;