import { Link } from "react-router-dom";
import TitleBanner from "../../components/shared/TitleBanner";
import LoginForm from "../../components/auth/LoginForm";

export const LoginPage = () => {
  return (
    <>
      <TitleBanner title="Sign In" />

      <section className="login-section py-60">
        <div className="container-2">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8 col-sm-10 col-12">
              <div className="auth-modal-card p-4 p-sm-5 bg-white br-20 border shadow-sm">
                {/* Logo */}
                <div className="text-center mb-3">
                  <Link to="/" className="d-inline-block">
                    <img
                      src="/assets/media/logo.png"
                      alt="Clinic Logo"
                      style={{ maxHeight: "48px" }}
                    />
                  </Link>
                </div>

                {/* Title and Subtitle */}
                <div className="text-center mb-4">
                  <h3 className="medium-black fw-700 mb-2">Welcome Back</h3>
                  <p className="dark-gray subtitle fs-14">
                    Sign in to continue your care journey.
                  </p>
                </div>

                <LoginForm idPrefix="page" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LoginPage;
