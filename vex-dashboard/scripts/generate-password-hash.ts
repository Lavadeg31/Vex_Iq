import bcrypt from 'bcryptjs'

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  console.log('Your hashed password:', hash)
}

hashPassword('Amsterdam1!?') 