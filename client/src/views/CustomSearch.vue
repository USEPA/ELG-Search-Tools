<template>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="is-size-3">
          Custom Search
        </h1>
      </div>
      <div class="column">
        <HelpLinks />
      </div>
    </div>
    <div class="columns form-container">
      <div class="column">
        <div class="field has-addons">
          <p class="control has-text-grey-dark has-text-weight-semibold select-label">
            Point Source Category:
          </p>
          <p class="control">
            <span class="select">
              <select class="is-medium">
                <option>Select Category</option>
                <option>Point Source Category</option>
                <option>Pollutant</option>
                <option>Treatment Technology</option>
              </select>
            </span>
          </p>
        </div>
        <div class="field has-addons">
          <p class="control has-text-grey-dark has-text-weight-semibold select-label">
            Subcategory:
          </p>
          <p class="control">
            <span class="select">
              <select class="is-medium">
                <option>Select Category</option>
                <option>Point Source Category</option>
                <option>Pollutant</option>
                <option>Treatment Technology</option>
              </select>
            </span>
          </p>
        </div>
        <div class="field has-addons">
          <p class="control has-text-grey-dark has-text-weight-semibold select-label">
            Level of Control:
          </p>
          <p class="control">
            <span class="select">
              <select class="is-medium">
                <option>Select Category</option>
                <option>Point Source Category</option>
                <option>Pollutant</option>
                <option>Treatment Technology</option>
              </select>
            </span>
          </p>
        </div>
        <div class="field has-addons">
          <p class="control has-text-grey-dark has-text-weight-semibold select-label">
            Primary Wastestream/Process Operation:
          </p>
          <p class="control">
            <span class="select">
              <select class="is-medium">
                <option>Select Category</option>
                <option>Point Source Category</option>
                <option>Pollutant</option>
                <option>Treatment Technology</option>
              </select>
            </span>
          </p>
        </div>
        <div class="field has-addons">
          <p class="control has-text-grey-dark has-text-weight-semibold select-label">
            Pollutant Name:
          </p>
          <p class="control">
            <span class="select">
              <select class="is-medium">
                <option>Select Category</option>
                <option>Point Source Category</option>
                <option>Pollutant</option>
                <option>Treatment Technology</option>
              </select>
            </span>
          </p>
        </div>
        <div class="field has-addons">
          <p class="control has-text-grey-dark has-text-weight-semibold select-label">
            SIC Code:
          </p>
          <p class="control">
            <span class="select">
              <select class="is-medium">
                <option>Select Category</option>
                <option>Point Source Category</option>
                <option>Pollutant</option>
                <option>Treatment Technology</option>
              </select>
            </span>
          </p>
        </div>
        <div class="field has-addons">
          <p class="control has-text-grey-dark has-text-weight-semibold select-label">
            NAICS Code:
          </p>
          <p class="control">
            <span class="select">
              <select class="is-medium">
                <option>Select Category</option>
                <option>Point Source Category</option>
                <option>Pollutant</option>
                <option>Treatment Technology</option>
              </select>
            </span>
          </p>
        </div>
      </div>
      <div class="column">
        <div class="field has-addons">
          <p class="control has-text-grey-dark has-text-weight-semibold select-label">
            Treatment Technology(ies):
          </p>
          <p class="control">
            <span class="select">
              <select class="is-medium">
                <option>Select Category</option>
                <option>Point Source Category</option>
                <option>Pollutant</option>
                <option>Treatment Technology</option>
              </select>
            </span>
          </p>
        </div>
        <div class="field has-addons">
          <p class="control has-text-grey-dark has-text-weight-semibold select-label">
            Keyword:
          </p>
          <p class="control">
            <input class="input" type="text" placeholder="Enter Keyword(s)" />
          </p>
        </div>
        <div class="field has-addons">
          <p class="control has-text-grey-dark has-text-weight-semibold checkbox-label">
            Zero Discharge?:
          </p>
          <p class="control">
            <input
              class="is-checkradio is-info is-rtl has-background-color"
              id="BMPa"
              type="checkbox"
              value="BMP"
              :checked="true"
            />
            <label for="BMPa"></label>
          </p>
        </div>
        <div class="field has-addons">
          <p class="control has-text-grey-dark has-text-weight-semibold checkbox-label">
            Best Management Practice(BMP) Requirements?:
          </p>
          <p class="control">
            <input
              class="is-checkradio is-info is-rtl has-background-color"
              id="BMPb"
              type="checkbox"
              value="BMP"
              :checked="true"
            />
            <label for="BMPb"></label>
          </p>
        </div>
        <div class="field has-addons">
          <p class="control has-text-grey-dark has-text-weight-semibold checkbox-label">
            Voluntary Requirements?:
          </p>
          <p class="control">
            <input
              class="is-checkradio is-info is-rtl has-background-color"
              id="BMPc"
              type="checkbox"
              value="BMP"
              :checked="true"
            />
            <label for="BMPc"></label>
          </p>
        </div>
        <div class="field has-addons">
          <p class="control has-text-grey-dark has-text-weight-semibold checkbox-label">
            No Pollutant Limitations?:
          </p>
          <p class="control">
            <input
              class="is-checkradio is-info is-rtl has-background-color"
              id="BMPd"
              type="checkbox"
              value="BMP"
              :checked="true"
            />
            <label for="BMPd"></label>
          </p>
        </div>
      </div>
    </div>
    <div class="columns">
      <div class="column is-6 is-offset-3">
        <button class="button has-text-white has-text-weight-semibold">
          Search
        </button>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CustomSearch',
};
</script>

<style lang="scss" scoped>
@import '../../static/variables';

button {
  background: $blue;
  width: 23em;
  height: 3em;
  font-size: 18px;
}

.select-label {
  padding-top: 3px;
  width: 15em;
}

select,
input {
  width: 270px;
}

.checkbox-label {
  width: 23em;
}

.column.is-6 {
  padding-left: 6em;
}

.form-container {
  margin-top: 30px;
  margin-bottom: 30px;
}
</style>
