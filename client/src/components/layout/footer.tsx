import { Link } from "wouter";
import { Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold mb-4">EquityForge.io</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting talented professionals with innovative companies
              and equity opportunities. Build your future with us.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* For Talent Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4">For Talent</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/opportunities">
                  <a className="text-gray-400 hover:text-white transition-colors text-sm">
                    Find Jobs
                  </a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Browse Companies
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Salary Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Career Resources
                </a>
              </li>
            </ul>
          </div>

          {/* For Companies Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4">For Companies</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/post-opportunity">
                  <a className="text-gray-400 hover:text-white transition-colors text-sm">
                    Post Jobs
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/find-talent">
                  <a className="text-gray-400 hover:text-white transition-colors text-sm">
                    Find Talent
                  </a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Success Stories
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <p className="text-center text-gray-400 text-sm">
            © 2024 EquityForge.io. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}