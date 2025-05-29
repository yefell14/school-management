import Image from 'next/image'

export function OverlayLogo() {
  return (
    <div className="fixed left-4 top-2 z-50">
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden flex items-center justify-center">
        <Image
          src="/images/logo/logoMA.png"
          alt="Logo María de los Ángeles"
          width={80}
          height={80}
          className="object-contain"
          priority
        />
      </div>
    </div>
  )
}
