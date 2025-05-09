"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { cn } from "@/lib/utils"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem("user")
      if (userData) {
        setIsLoggedIn(true)
        const user = JSON.parse(userData)
        setUserRole(user.role)
      }
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    checkAuth()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ]

  const serviceLinks = [
    { name: "Tax Filing", path: "/services/tax-filing" },
    { name: "Tax Registration", path: "/services/tax-registration" },
    { name: "Wealth Statement", path: "/services/wealth-statement" },
    { name: "Corporate Services", path: "/services/corporate" },
    { name: "Compliance Advisory", path: "/services/compliance" },
  ]

  const loggedInLinks = {
    user: [{ name: "Dashboard", path: "/dashboard" }],
    admin: [{ name: "Admin Panel", path: "/dashboard/admin" }],
    accountant: [{ name: "Accounts", path: "/dashboard/accountant" }],
  }

  return (
    <header
      className={cn("fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300", {
        "bg-background/80 backdrop-blur-md border-b shadow-sm": isScrolled,
        "bg-transparent": !isScrolled,
      })}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="https://www.befiler.com/dashboard/assets/images/logo.png"
                alt="Befiler Logo"
                width={120}
                height={40}
                priority
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <React.Fragment key={link.name}>
                {link.name === "Services" ? (
                  <div className="relative group">
                    <button
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent",
                        pathname.startsWith("/services") ? "text-primary" : "text-foreground",
                      )}
                    >
                      {link.name} <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    {/* Add a transparent bridge to prevent gap between button and dropdown */}
                    <div className="absolute left-0 h-2 w-full"></div>
                    <div className="absolute left-0 top-full w-48 rounded-md shadow-lg py-1 bg-background border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                      {serviceLinks.map((service) => (
                        <Link
                          key={service.name}
                          href={service.path}
                          className="block px-4 py-2 text-sm hover:bg-accent"
                        >
                          {service.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={link.path}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent",
                      pathname === link.path ? "text-primary" : "text-foreground",
                    )}
                  >
                    {link.name}
                  </Link>
                )}
              </React.Fragment>
            ))}

            {isLoggedIn &&
              userRole &&
              loggedInLinks[userRole as keyof typeof loggedInLinks]?.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent",
                    pathname === link.path ? "text-primary" : "text-foreground",
                  )}
                >
                  {link.name}
                </Link>
              ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <ModeToggle />

            {isLoggedIn ? (
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem("user")
                  localStorage.removeItem("token")
                  setIsLoggedIn(false)
                  setUserRole(null)
                  window.location.href = "/"
                }}
              >
                Log Out
              </Button>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="default" className="bg-[#af0e0e] hover:bg-[#8a0b0b]">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <ModeToggle />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <React.Fragment key={link.name}>
                {link.name === "Services" ? (
                  <div className="py-2">
                    <button
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-base font-medium rounded-md hover:bg-accent",
                        pathname.startsWith("/services") ? "text-primary" : "text-foreground",
                      )}
                    >
                      {link.name} <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    <div className="pl-4 mt-1 space-y-1">
                      {serviceLinks.map((service) => (
                        <Link
                          key={service.name}
                          href={service.path}
                          className="block px-3 py-2 text-sm rounded-md hover:bg-accent"
                          onClick={toggleMenu}
                        >
                          {service.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={link.path}
                    className={cn(
                      "block px-3 py-2 text-base font-medium rounded-md hover:bg-accent",
                      pathname === link.path ? "text-primary" : "text-foreground",
                    )}
                    onClick={toggleMenu}
                  >
                    {link.name}
                  </Link>
                )}
              </React.Fragment>
            ))}

            {isLoggedIn &&
              userRole &&
              loggedInLinks[userRole as keyof typeof loggedInLinks]?.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={cn(
                    "block px-3 py-2 text-base font-medium rounded-md hover:bg-accent",
                    pathname === link.path ? "text-primary" : "text-foreground",
                  )}
                  onClick={toggleMenu}
                >
                  {link.name}
                </Link>
              ))}

            <div className="pt-4 pb-3 border-t border-border">
              {isLoggedIn ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    localStorage.removeItem("user")
                    localStorage.removeItem("token")
                    setIsLoggedIn(false)
                    setUserRole(null)
                    setIsMenuOpen(false)
                    window.location.href = "/"
                  }}
                >
                  Log Out
                </Button>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link href="/auth/login" className="w-full" onClick={toggleMenu}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="w-full" onClick={toggleMenu}>
                    <Button variant="default" className="w-full bg-[#af0e0e] hover:bg-[#8a0b0b]">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
