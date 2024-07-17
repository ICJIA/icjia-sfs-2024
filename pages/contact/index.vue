<template>
  <div>
    <v-container class="mb-12" style="margin-top: 100px">
      <v-row justify="center" align="center" class="row">
        <v-col cols="12" md="12" class="text-left">
          <h1>Contact Us</h1>

          <v-form ref="form" class="mx-2 mt-13" v-model="valid" lazy-validation>
            <v-row>
              <!-- <v-col cols="12">
                <v-text-field
                  v-model="subject"
                  label="Subject"
                  disabled
                  style="font-weight: 700 !important"
                ></v-text-field>
              </v-col> -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="firstname"
                  :rules="nameRules"
                  label="First Name"
                  :disabled="successfullySubmitted"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="lastname"
                  :rules="nameRules"
                  label="Last Name"
                  :disabled="successfullySubmitted"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  :disabled="successfullySubmitted"
                  label="Email"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="phone"
                  label="Phone Number"
                  :disabled="successfullySubmitted"
                  :rules="phoneRules"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="message"
                  clearable
                  clear-icon="mdi-close-circle"
                  label="Message"
                  :disabled="successfullySubmitted"
                  auto-grow
                  required
                ></v-textarea>
              </v-col>
            </v-row>

            <div class="text-center mt-5" v-if="!successfullySubmitted">
              <v-btn @click="submitForm"> Submit </v-btn>&nbsp;&nbsp;&nbsp;

              <v-btn @click="clearForm" variant="outlined"> Clear </v-btn>
            </div>
            <div
              class="text-center mt-5"
              style="color: green; font-weight: 900"
              v-else
            >
              Your form was successfully submitted!
              <div style="color: #111; font-weight: 400" class="mt-2">
                &laquo;&nbsp;<nuxt-link
                  to="/"
                  style="color: #111; font-weight: 400"
                  >Back to home</nuxt-link
                >
              </div>
            </div>
          </v-form>
        </v-col>
      </v-row>
    </v-container>
    <div style="height: 75px" class="hidden-md-and-up"></div>
  </div>
</template>

<script>
import DOMPurify from "dompurify";
import axios from "axios";
const api = axios.create({
  timeout: 15000,
});
function sanitizeString(str) {
  str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim, "");
  return str.trim();
}

const dbInsert = async function ({ type, email, ...form }) {
  let axiosHeaders = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  let axiosDBSubmitData = {
    type,
    email,
    form,
  };
  try {
    return await api.post(
      `https://infonet.icjia-api.cloud/api/forms`,
      JSON.stringify(axiosDBSubmitData),
      axiosHeaders
    );
  } catch (e) {
    console.log(e);

    return `${e}`;
  }
};

export default {
  name: "RegisterForm",
  data: () => ({
    valid: false,
    successfullySubmitted: false,
    firstname: "",
    lastname: "",
    subject: "SFS Contact Submission",
    phone: "",
    message: "",
    myForm: {},
    nameRules: [
      (v) => !!v || "Name is required",
      (v) => (v && v.length <= 100) || "Name must be less than 100 characters",
    ],
    subjectRules: [
      (v) => !!v || "Subject is required",
      (v) =>
        (v && v.length <= 100) || "Subject must be less than 100 characters",
    ],

    phoneRules: [(v) => !!v || "Contact phone number is required"],
    email: "",
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) =>
        /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()\\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          v
        ) || "E-mail must be valid",
    ],
  }),
  methods: {
    async submitForm() {
      this.$refs.form.validate();
      this.subject = sanitizeString(this.subject);
      let myForm;
      if (this.valid) {
        myForm = {
          type: "InfoNet Contact",
          subject: DOMPurify.sanitize(this.subject).replace(
            /(<([^>]+)>)/gi,
            ""
          ),
          firstname: DOMPurify.sanitize(this.firstname).replace(
            /(<([^>]+)>)/gi,
            ""
          ),
          lastname: DOMPurify.sanitize(this.lastname).replace(
            /(<([^>]+)>)/gi,
            ""
          ),
          email: DOMPurify.sanitize(this.email).replace(/(<([^>]+)>)/gi, ""),
          phone: DOMPurify.sanitize(this.phone).replace(/(<([^>]+)>)/gi, ""),
          message: DOMPurify.sanitize(this.message).replace(
            /(<([^>]+)>)/gi,
            ""
          ),
        };

        // let dbResponse = await dbInsert(this.form);
        // console.log("dbinsert: ", dbResponse);

        // console.table(axiosDBSubmitData);

        let axiosHeaders = {
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        };

        let axiosDBSubmitData = {
          type: myForm.type,
          email: myForm.email,
          subject: myForm.subject,
          form: myForm,
        };

        // try {
        //   await api.post(
        //     `https://infonet.icjia-api.cloud/api/forms`,
        //     JSON.stringify({ data: axiosDBSubmitData }),
        //     axiosHeaders
        //   );
        //   console.log("db insert success");
        // } catch (e) {
        //   console.log(e);
        //   console.log("db insert failure");
        // }

        let emailData = {
          form: myForm,
        };

        let options = {
          method: "POST",
          data: JSON.stringify(emailData.form),
          url: "https://mail.icjia.cloud/internet/sfs",
        };

        //console.log("form email: ", axiosDBSubmitData);

        // try {
        //   console.log("Sending...");
        //   let res = await axios(options);
        //   //this.success(res);
        //   console.log("Email sent: ", res);
        // } catch (err) {
        //   console.log(err.message);
        //   console.log("nodemailer failure");
        // }

        this.successfullySubmitted = true;

        console.log("submitForm ", this.valid);
      }
    },
    clearForm() {
      this.$refs.form.reset();
      this.valid = false;
      this.successfullySubmitted = false;

      console.log("form cleared");
    },
  },
  mounted() {
    //this.$refs.form.reset();
    this.valid = false;
    this.successfullySubmitted = false;
    //console.log("Route query: ", this.$route.query);
    if (this.$route.query && this.$route.query.subject) {
      this.subject = sanitizeString(this.$route.query.subject);
    }
  },
};
</script>
<style scoped>
.fluid {
  margin: 0;
  padding: 0;
}
</style>
