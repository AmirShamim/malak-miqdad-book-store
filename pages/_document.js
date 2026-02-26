import { Html, Head, Main, NextScript } from 'next/document'

const setInitialTheme = `(function(){
  try{
    var stored = localStorage.getItem('theme');
    if(stored === 'dark'){
      document.documentElement.classList.add('dark');
    } else if(stored === 'light'){
      document.documentElement.classList.remove('dark');
    } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
      document.documentElement.classList.add('dark');
    }
  }catch(e){}
})();`

export default function Document(){
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet" />
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
