import { supabase } from './supabase'

/* =========================
   STUDENT SIGNUP
========================= */
export const signUpStudent = async (email, password, name) => {

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    alert(error.message)
    return null
  }

  // ⚠️ IMPORTANT: sometimes user is null if email confirm is ON
  const user = data?.user

  if (!user) {
    alert("Signup successful. Please check your email.")
    return null
  }

  // insert into profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: user.id,   // 🔥 MUST match auth user id
        name: name,
        email: email,
        role: 'student'
      }
    ])

  if (profileError) {
    alert(profileError.message)
    return null
  }

  return user
}


/* =========================
   LOGIN (ALL USERS)
========================= */
export const loginUser = async (email, password) => {

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    alert(error.message)
    return null
  }

  const user = data.user

  // fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    alert("Profile not found. Contact admin.")
    return null
  }

  return profile
}


/* =========================
   GET CURRENT USER
========================= */
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error(error.message)
    return null
  }

  return data.user
}


/* =========================
   LOGOUT
========================= */
export const logoutUser = async () => {
  await supabase.auth.signOut()
  window.location.href = '/login'
}