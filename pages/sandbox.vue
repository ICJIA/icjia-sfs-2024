<template>
  <div style="margin-top: 100px">
    <h1>Sandbox</h1>

    <v-icon>mdi-human-male-child</v-icon>
    <v-icon>mdi-human-greeting-variant</v-icon>
    <v-icon>mdi-thought-bubble-outline</v-icon>

    <h1>Three Columns Layout</h1>
    <div class="flex-container">
      <div class="flex-item">
        <div>
          <v-icon style="font-size: 120px; color: green" class="mb-6"
            >mdi-human-male-child</v-icon
          >
          <br />
          A significant reduction in the number of children that scored in the
          borderline or clinical ranges for social, emotional, and behavioral
          concerns after receiving services.
        </div>
      </div>
      <div class="flex-item">
        <div>
          <v-icon style="font-size: 120px; color: green" class="mb-6"
            >mdi-human-greeting-variant</v-icon
          ><br />
          Caregivers had reduced stress.
        </div>
      </div>
      <div class="flex-item">
        <div>
          <v-icon style="font-size: 120px; color: green" class="mb-6"
            >mdi-thought-bubble-outline</v-icon
          ><br />
          Children’s ability to identify feelings and caregiver’s knowledge of
          trauma and its impact improved.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.flex-item {
  flex: 1 1 calc(33.333% - 20px);
  box-sizing: border-box;
  padding: 40px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
</style>
