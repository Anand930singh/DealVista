import { useEffect } from "react"
import { Navbar } from "../../components/Navbar/Navbar"
import { Footer } from "../../components/Footer/Footer"
import { setPageMeta, SEO } from "../../services/seo"
import "./upload.css"
import { CouponForm } from "../../components/CouponForm/couponform"

export function Upload() {
  useEffect(() => {
    setPageMeta(SEO.upload.title, SEO.upload.description, SEO.upload.canonical)
  }, [])

  return (
    <div className="upload-page">
      <Navbar />
      <main>
        <CouponForm />
      </main>
      <Footer />
    </div>
  )
}