import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

const HeroSection = () => {
  const { t } = useTranslation('common');
  return (
    <VideoBackground video={'/envelopes.mp4'}>
      <div className="hero py-52">
        <div className="hero-content text-center">
          <div className="max-w-7md">
            <h1 className="text-6xl font-bold text-blue-600">
              {' '}
              {t('newsletter-automation-made-easy')}
            </h1>
            <p className="py-6 text-2xl font-normal">
              {t('kickstart-your-newsletter')}
            </p>
            <div className="flex items-center justify-center gap-2 ">
              <Link
                href="/auth/join"
                className="btn btn-primary px-8 no-underline"
              >
                {t('get-started')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </VideoBackground>
  );
};

export default HeroSection;

const VideoBackground = ({
  video,
  children,
}: { video: any } & PropsWithChildren) => {
  return (
    <div className="relative flex w-full grow">
      <video
        className="border"
        style={{
          position: 'absolute',
          aspectRatio: 'auto',
          width: '100%',
          height: '100%',
          zIndex: -1,
          objectFit: 'cover',
          objectPosition: '40% 40%',
          left: '0',
          top: '0',
        }}
        src={video}
        autoPlay
        loop
        muted
      />
      <div
        style={{
          zIndex: -1,
          backgroundColor: 'rgba(20,100,20,0.05)',
          position: 'fixed',
          height: '100%',
          width: '100%',
          left: '0',
          top: '0',
        }}
      ></div>
      {children}
    </div>
  );
};
