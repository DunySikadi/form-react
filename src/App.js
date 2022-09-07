import { useFieldArray, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

function App() {
  const yupSchema = yup.object({
    name: yup
      .string()
      .required("Le champ est obligatoire")
      .min(2, "trop court")
      .max(5, "trop long")
      .test("isYes", "Vous n'avez pas de chance", async () => {
        const response = await fetch("https://yesno.wtf/api");
        const result = await response.json();
        return result.answer === "yes";
      }),
    age: yup
      .number()
      .typeError("Veuillez entrer un nombre")
      .min(18, "trop petit"),
    password: yup
      .string()
      .required("le mot de passe est obligatioire")
      .min(5, "mot de passe trop court")
      .max(10, "mot de passe trop long"),
    confirmPassword: yup
      .string()
      .required("Vous devez confirmer votre mot de passe")
      .oneOf(
        [yup.ref("password"), ""],
        "les mot de passe ne correspondent pas"
      ),

    activities: yup.array().of(
      yup.object({
        level: yup.string().equals([""], "Vous ne pouvez pas etre un debutant"),
      })
    ),
  });

  const defaultValues = {
    name: "",
    gender: "man",
    age: "",
    password: "",
    confirmPassword: "",
    other: {
      sign: "",
      happy: false,
    },
    activities: [],
  };

  const {
    control,
    register,
    handleSubmit,
    // getValues,
    // watch,
    reset,
    // setFocus,
    setError,
    clearErrors,
    trigger,
    formState: { errors, isSubmitting, submitCount },
  } = useForm({
    defaultValues,
    mode: "onChange",
    criteriaMode: "all",
    resolver: yupResolver(yupSchema),
  });

  const { fields, append, remove } = useFieldArray({
    name: "activities",
    control,
  });

  // console.log(fields);

  function addActivity() {
    append({
      value: "",
      level: "expert",
    });
  }

  function deleteActivity(i) {
    remove(i);
  }

  //watch();
  //console.log(errors);
  async function submit(values) {
    console.log(values);
    try {
      clearErrors();
      const response = await fetch("https://restapi.fr/api/testr", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        // throw new Error("le nom n'est pas correct");
        const newUser = await response.json();
        reset(defaultValues);
        console.log(newUser);
      } else {
        console.log("error");
      }
    } catch (error) {
      setError(
        "globalError",
        { type: "wrong name", message: error.message }
        // { shouldFocus: true }
      );
      // console.log("error");
    }
  }

  return (
    <div
      className="d-flex flex-row justify-content-center align-items-center"
      style={{ background: "#fefefe", height: "100vh", width: "100%" }}
    >
      <form onSubmit={handleSubmit(submit)}>
        <div className="d-flex flex-column mb-20">
          <label className="mb-5" htmlFor="name">
            Nom
          </label>
          <input
            {...register("name", {
              onBlur() {
                trigger("name");
              },
            })}
            id="name"
            type="text"
          />
        </div>
        {errors?.name && (
          <ul>
            {Object.keys(errors.name.types).map((k) => (
              <li key={k}>{errors.name.types[k]}</li>
            ))}
          </ul>
        )}
        <div className="d-flex flex-column mb-20">
          <label className="mb-5" htmlFor="age">
            Age
          </label>
          <input {...register("age")} id="age" type="number" />
        </div>
        {errors?.age && <p>{errors.age.message}</p>}
        <div className="d-flex flex-column mb-20">
          <label className="mb-5" htmlFor="sexe">
            sexe
          </label>
          <div>
            <label htmlFor="man">Homme</label>
            <input {...register("gender")} type="radio" value="man" id="man" />
          </div>
          <div>
            <label htmlFor="woman">Femme</label>
            <input
              {...register("gender")}
              type="radio"
              value="woman"
              id="woman"
            />
          </div>
        </div>
        <div className="d-flex flex-column mb-20">
          <label className="mb-5" htmlFor="happy">
            content ?
            <input {...register("other.happy")} id="happy" type="checkbox" />
          </label>
        </div>
        <div className="d-flex flex-column mb-20">
          <label className="mb-5" htmlFor="sign">
            signe
          </label>
          <select {...register("other.sign")} id="sign">
            <option value="" disabled>
              choisissez un signe
            </option>
            <option value="fish">poisson</option>
            <option value="aquarius">verseau</option>
          </select>
        </div>
        <div className="d-flex flex-column mb-20">
          <label className="mb-5" htmlFor="password">
            Mot de passe
          </label>
          <input
            {...register("password")}
            id="password"
            type="password"
            className="mb-20"
          />
        </div>
        <div className="d-flex flex-column mb-20">
          {errors?.password && <p>{errors.password.message}</p>}
          <label className="mb-5" htmlFor="confirmPassword">
            Confirmation password
          </label>
          <input
            {...register("confirmPassword")}
            id="confirmPassword"
            type="password"
            className="mb-20"
          />
          {errors?.confirmPassword && <p>{errors.confirmPassword.message}</p>}
        </div>
        <div className="d-flex flex-column mb-20">
          <label className="d-flex flex flex-row justify-content-center align-items-center">
            <span className="flex-fill">Activités</span>
            <button
              onClick={addActivity}
              type="button"
              className="btn btn-reverse-primary "
            >
              +
            </button>
          </label>
          <ul>
            {fields.map((activity, i) => (
              <li key={activity.id} className="d-flex flex-row">
                <input
                  {...register(`activities[${i}].value`)}
                  className="flex-fill mr-15"
                  type="text"
                />
                <select {...register(`activities[${i}].level`)}>
                  <option value="beginner"> Débutant</option>
                  <option value="beginner"> Expert</option>
                </select>
                <button
                  type="button"
                  onClick={() => deleteActivity(i)}
                  className="btn btn-primary"
                >
                  -
                </button>
                {errors.activities?.length && errors.activities[i]?.level && (
                  <p>{errors.activities[i].level.message}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
        {errors.globalError && <p> {errors.globalError.message}</p>}
        <button disabled={isSubmitting} className="btn btn-primary">
          Save ({submitCount})
        </button>
      </form>
    </div>
  );
}
export default App;
