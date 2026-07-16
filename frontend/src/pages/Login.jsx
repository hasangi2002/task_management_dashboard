import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Loader2 } from 'lucide-react';

const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const { login } = useAuth();

  const navigate = useNavigate();



  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');
    setLoading(true);


    try {

      const user = await login(email, password);


      if (user.role === "admin") {

        navigate("/projects");

      } else {

        navigate('/projects');

      }


    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Login failed. Check your credentials."
      );

    } finally {

      setLoading(false);

    }

  };




  return (

    <div className="min-h-screen flex items-center justify-center bg-background px-4">


      <div className="w-full max-w-sm">


        <div className="flex flex-col items-center gap-3 mb-8">


          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">

            <Film className="w-6 h-6 text-white"/>

          </div>


          <h1 className="text-2xl font-bold font-outfit">
            Campaign Dashboard
          </h1>


          <p className="text-sm text-slate-500">
            Sign in to continue
          </p>


        </div>




        <form 
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm"
        >


          {
            error &&

            <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-sm rounded-lg px-3 py-2">

              {error}

            </div>

          }




          <div className="space-y-1">


            <label className="text-xs font-semibold text-slate-500 uppercase">
              Email
            </label>


            <input

              required

              type="email"

              className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm"

              value={email}

              onChange={(e)=>setEmail(e.target.value)}

            />


          </div>





          <div className="space-y-1">


            <label className="text-xs font-semibold text-slate-500 uppercase">
              Password
            </label>


            <input

              required

              type="password"

              className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm"

              value={password}

              onChange={(e)=>setPassword(e.target.value)}

            />


          </div>





          <button

            type="submit"

            disabled={loading}

            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold flex justify-center items-center gap-2"

          >

            {
              loading &&
              <Loader2 className="w-4 h-4 animate-spin"/>
            }


            Sign In


          </button>



        </form>





        <p className="text-center text-xs text-slate-500 mt-4">

          Setting up for the first time?{' '}

          <Link 
            to="/register"
            className="text-red-600 hover:underline font-medium"
          >
            Create an admin account
          </Link>

        </p>



      </div>


    </div>

  );

};


export default Login;